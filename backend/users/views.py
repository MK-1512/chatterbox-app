from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, UserListSerializer
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
        return CustomUser.objects.exclude(id=self.request.user.id)

class OnlineUsersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserListSerializer

    def get_queryset(self):
        try:
            import redis
            r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
            online_user_ids = r.smembers('online_users')
            return CustomUser.objects.filter(id__in=online_user_ids)
        except Exception as e:
            print(f"Could not connect to Redis to get online users: {e}")
            return CustomUser.objects.none()