import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, ChatRoom
from users.models import CustomUser
import redis.asyncio as redis
from django.conf import settings

# --- ChatConsumer is unchanged ---
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
                'id': new_message.id, 'author': {'username': self.user.username, 'avatar': self.user.avatar.url if self.user.avatar else None},
                'content': new_message.content, 'timestamp': new_message.timestamp.isoformat(), 'room': new_message.room.id
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

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'chat_message', 'message': event['message']}))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({'type': 'typing', 'user': event['user'], 'is_typing': event['is_typing']}))

    @database_sync_to_async
    def save_message(self, message_content):
        room = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(room=room, author=self.user, content=message_content)

    @database_sync_to_async
    def get_room(self, room_id):
        return ChatRoom.objects.get(id=room_id)

    @database_sync_to_async
    def get_room_participants(self, room):
        return list(room.participants.all())

# --- NotificationConsumer now has extensive logging ---
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
        else:
            print(f"\n[NotificationConsumer] User '{self.user.username}' (ID: {self.user.id}) attempting to connect.")
            self.user_group_name = f'user_notifications_{self.user.id}'
            self.global_group_name = 'global_notifications'
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            await self.channel_layer.group_add(self.global_group_name, self.channel_name)
            await self.accept()
            print(f"[NotificationConsumer] User '{self.user.username}' connected successfully.")

            try:
                self.redis = await redis.Redis.from_url(settings.REDIS_URL)
                print("[NotificationConsumer] Redis connection successful.")
                await self.redis.sadd('online_users', self.user.id)
                print(f"[NotificationConsumer] Added user ID {self.user.id} to 'online_users' set in Redis.")
                await self.channel_layer.group_send(
                    self.global_group_name,
                    {'type': 'send.user.status', 'user_id': self.user.id, 'status': 'online'}
                )
                print(f"[NotificationConsumer] Broadcasted 'online' status for user {self.user.id}.\n")
            except Exception as e:
                print(f"[NotificationConsumer] !!! REDIS ERROR ON CONNECT: {e} !!!\n")

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            print(f"\n[NotificationConsumer] User '{self.user.username}' (ID: {self.user.id}) attempting to disconnect.")
            try:
                self.redis = await redis.Redis.from_url(settings.REDIS_URL)
                print("[NotificationConsumer] Redis connection successful for disconnect.")
                await self.redis.srem('online_users', self.user.id)
                print(f"[NotificationConsumer] Removed user ID {self.user.id} from 'online_users' set in Redis.")
                await self.channel_layer.group_send(
                    self.global_group_name,
                    {'type': 'send.user.status', 'user_id': self.user.id, 'status': 'offline'}
                )
                print(f"[NotificationConsumer] Broadcasted 'offline' status for user {self.user.id}.\n")
            except Exception as e:
                print(f"[NotificationConsumer] !!! REDIS ERROR ON DISCONNECT: {e} !!!\n")

            await self.channel_layer.group_discard(self.global_group_name, self.channel_name)
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
            print(f"[NotificationConsumer] User '{self.user.username}' disconnected successfully.")

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({'type': 'notification', 'message': event['message']}))

    async def send_user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))