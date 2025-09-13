from rest_framework import generics
from rest_framework.permissions import AllowAny,IsAuthenticated
from .serializers import UserSerializer,UserListSerializer
from .models import CustomUser
import redis
from django.conf import settings

class UserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserListSerializer

    def get_queryset(self):
        # Exclude the current user from the list
        return CustomUser.objects.exclude(id=self.request.user.id)
    
