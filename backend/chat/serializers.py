from rest_framework import serializers
from .models import Message, ChatRoom
from users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'author', 'content', 'timestamp', 'read_by')

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ('id', 'name', 'participants','room_type')