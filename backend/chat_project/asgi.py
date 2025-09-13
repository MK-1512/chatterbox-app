import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_project.settings')

django_asgi_app = get_asgi_application()

# Import middleware and routing AFTER django is setup
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.middleware import JwtAuthMiddleware  # <-- Import our new middleware
import chat.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddleware(  # <-- Use our new middleware
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})