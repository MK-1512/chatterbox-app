from django.db.models import Count, Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, Message
from users.models import CustomUser
from .serializers import ChatRoomSerializer, MessageSerializer

class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.chat_rooms.all()

    @action(detail=False, methods=['get'])
    def get_or_create_general_room(self, request):
        general_room, created = ChatRoom.objects.get_or_create(name="General", room_type='group')
        if request.user not in general_room.participants.all():
            general_room.participants.add(request.user)
        serializer = self.get_serializer(general_room)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def start_private_chat(self, request):
        print("\n" + "="*50)
        print("-----> STARTING 'start_private_chat' <-----")
        
        target_user_id = request.data.get('target_user_id')
        user1 = request.user
        print(f"Requesting User (user1): {user1.username} (ID: {user1.id})")
        
        try:
            user2 = CustomUser.objects.get(id=target_user_id)
            print(f"Target User (user2): {user2.username} (ID: {target_user_id})")
        except CustomUser.DoesNotExist:
            print("!!! ERROR: Target user not found.")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        sorted_ids = sorted([user1.id, user2.id])
        room_name = f"private_{sorted_ids[0]}-{sorted_ids[1]}"
        print(f"Generated unique room name: '{room_name}'")

        room, created = ChatRoom.objects.get_or_create(
            name=room_name,
            defaults={'room_type': 'private'}
        )

        if created:
            print(f"DATABASE: Room '{room_name}' did NOT exist. Creating it.")
            room.participants.add(user1, user2)
            print(f"DATABASE: Added '{user1.username}' and '{user2.username}' to participants.")
        else:
            print(f"DATABASE: Room '{room_name}' ALREADY EXISTS. Using existing room.")

        room_from_db = ChatRoom.objects.get(id=room.id)
        participant_list = [p.username for p in room_from_db.participants.all()]
        print(f"FINAL CHECK: Participants in room '{room_from_db.name}' (ID: {room_from_db.id}) are: {participant_list}")
        
        serializer = self.get_serializer(room_from_db)
        print("-----> FINISHED 'start_private_chat' <-----")
        print("="*50 + "\n")
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        room_pk = self.kwargs.get('room_pk')
        if room_pk:
            return Message.objects.filter(room_id=room_pk).order_by('timestamp')
        return Message.objects.none()