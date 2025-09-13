import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, ChatRoom
from users.models import CustomUser


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
        else:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.typing',
                'user': self.user.username,
                'is_typing': False
            }
        )
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'chat_message':
            message_content = data['message']
            new_message = await self.save_message(message_content)
            
            # Broadcast the new message to the chat room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.message', 
                    'message': {
                        'id': new_message.id,
                        'author': {
                            'username': self.user.username,
                            'avatar': self.user.avatar.url if self.user.avatar else None
                        },
                        'content': new_message.content,
                        'timestamp': new_message.timestamp.isoformat(),
                        'room': new_message.room.id # <-- ADDED THIS
                    }
                }
            )

            # --- NEW: SEND NOTIFICATION TO OTHER PARTICIPANTS ---
            room = await self.get_room(new_message.room.id)
            participants = await self.get_room_participants(room)

            for participant in participants:
                if participant != self.user: # Don't send notification to the sender
                    await self.channel_layer.group_send(
                        f'user_notifications_{participant.id}',
                        {
                            'type': 'send.notification',
                            'message': {
                                'type': 'new_message',
                                'room_id': new_message.room.id,
                            }
                        }
                    )

        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.typing',
                    'user': self.user.username,
                    'is_typing': data['is_typing']
                }
            )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))

    @database_sync_to_async
    def save_message(self, message_content):
        room = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(room=room, author=self.user, content=message_content)

    # --- NEW HELPER METHODS ---
    @database_sync_to_async
    def get_room(self, room_id):
        return ChatRoom.objects.get(id=room_id)

    @database_sync_to_async
    def get_room_participants(self, room):
        return list(room.participants.all())


# --- NEW NOTIFICATION CONSUMER CLASS ---
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
        else:
            # Join a group unique to the user, e.g., 'user_notifications_1'
            self.group_name = f'user_notifications_{self.user.id}'
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # This is the handler that will be called from the ChatConsumer
    async def send_notification(self, event):
        # Sends the actual notification message down to the client
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event['message']
        }))