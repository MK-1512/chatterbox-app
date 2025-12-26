from django.db import models
from users.models import CustomUser

class ChatRoom(models.Model):
    ROOM_TYPE_CHOICES = (
        ('group', 'Group'),
        ('private', 'Private'),
    )
    name = models.CharField(max_length=255)
    participants = models.ManyToManyField(CustomUser, related_name='chat_rooms')
    room_type = models.CharField(max_length=10, choices=ROOM_TYPE_CHOICES, default='group')

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='authored_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read_by = models.ManyToManyField(CustomUser, related_name='read_messages', blank=True)

    def __str__(self):
        return f'{self.author.username}: {self.content[:20]}'
    
    class Meta:
        ordering = ['timestamp']