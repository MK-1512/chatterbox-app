from rest_framework_nested import routers
from .views import ChatRoomViewSet

router = routers.SimpleRouter()
router.register(r'chatrooms', ChatRoomViewSet, basename='chatroom')

# Note: We don't need the MessageViewSet URLs here anymore
# because the custom action handles finding the room.
# The nested router for messages is still needed for fetching history.
from .views import MessageViewSet
messages_router = routers.NestedSimpleRouter(router, r'chatrooms', lookup='room')
messages_router.register(r'messages', MessageViewSet, basename='room-messages')

urlpatterns = router.urls + messages_router.urls