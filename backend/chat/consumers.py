import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, ChatRoom
from users.models import CustomUser
import redis.asyncio as redis
from django.conf import settings

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
        else:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat.typing', 'user': self.user.username, 'is_typing': False}
        )
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'chat_message':
            message_content = data['message']
            new_message = await self.save_message(message_content)
            
            message_payload = {
                'id': new_message.id,
                'author': {'username': self.user.username, 'avatar': self.user.avatar.url if self.user.avatar else None},
                'content': new_message.content,
                'timestamp': new_message.timestamp.isoformat(),
                'room': new_message.room.id,
                'read_by': []
            }
            
            await self.channel_layer.group_send(self.room_group_name, {'type': 'chat.message', 'message': message_payload})
            
            room = await self.get_room(new_message.room.id)
            participants = await self.get_room_participants(room)
            for participant in participants:
                if participant != self.user:
                    await self.channel_layer.group_send(
                        f'user_notifications_{participant.id}',
                        {'type': 'send.notification', 'message': {'type': 'new_message', 'room_id': new_message.room.id}}
                    )
        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'chat.typing', 'user': self.user.username, 'is_typing': data['is_typing']}
            )
        
        elif message_type == 'read_receipt':
            message_id = data['message_id']
            await self.mark_message_as_read(message_id, self.user)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message.read',
                    'message_id': message_id,
                    'read_by_user': self.user.username
                }
            )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({'type': 'chat_message', 'message': message}, ensure_ascii=False))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({'type': 'typing', 'user': event['user'], 'is_typing': event['is_typing']}, ensure_ascii=False))

    async def message_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id'],
            'read_by_user': event['read_by_user']
        }, ensure_ascii=False))

    @database_sync_to_async
    def save_message(self, message_content):
        room = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(room=room, author=self.user, content=message_content)

    @database_sync_to_async
    def mark_message_as_read(self, message_id, user):
        try:
            message = Message.objects.get(id=message_id)
            if user not in message.read_by.all():
                message.read_by.add(user)
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def get_room(self, room_id):
        return ChatRoom.objects.get(id=room_id)

    @database_sync_to_async
    def get_room_participants(self, room):
        return list(room.participants.all())

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
        else:
            self.user_group_name = f'user_notifications_{self.user.id}'
            self.global_group_name = 'global_notifications'
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            await self.channel_layer.group_add(self.global_group_name, self.channel_name)
            await self.accept()
            self.redis = await redis.Redis.from_url(settings.REDIS_URL)
            await self.redis.sadd('online_users', self.user.id)
            await self.channel_layer.group_send(
                self.global_group_name,
                {'type': 'send.user.status', 'user_id': self.user.id, 'status': 'online'}
            )

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            self.redis = await redis.Redis.from_url(settings.REDIS_URL)
            await self.redis.srem('online_users', self.user.id)
            await self.channel_layer.group_send(
                self.global_group_name,
                {'type': 'send.user.status', 'user_id': self.user.id, 'status': 'offline'}
            )
            await self.channel_layer.group_discard(self.global_group_name, self.channel_name)
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def send_notification(self, event):
        # ADD ensure_ascii=False HERE AS WELL FOR SAFETY
        await self.send(text_data=json.dumps({'type': 'notification', 'message': event['message']}, ensure_ascii=False))

    async def send_user_status(self, event):
        # ADD ensure_ascii=False HERE AS WELL FOR SAFETY
        await self.send(text_data=json.dumps({'type': 'user_status', 'user_id': event['user_id'], 'status': event['status']}, ensure_ascii=False))