from rest_framework_nested import routers
from .views import ChatRoomViewSet

router = routers.SimpleRouter()
router.register(r'chatrooms', ChatRoomViewSet, basename='chatroom')

from .views import MessageViewSet
messages_router = routers.NestedSimpleRouter(router, r'chatrooms', lookup='room')
messages_router.register(r'messages', MessageViewSet, basename='room-messages')

urlpatterns = router.urls + messages_router.urls