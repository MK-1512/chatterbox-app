from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from users.models import CustomUser
from urllib.parse import parse_qs

class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()

        # Get token from the query string
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token is None:
            scope['user'] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        try:
            # This will automatically validate the token's signature and expiration
            UntypedToken(token)
            # You can add more validation here if you want
        except (InvalidToken, TokenError) as e:
            # Token is invalid
            scope['user'] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        # If the token is valid, get the user
        from jwt import decode as jwt_decode
        from django.conf import settings

        decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_data.get('user_id')

        try:
            user = await self.get_user(user_id)
            scope['user'] = user
        except CustomUser.DoesNotExist:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @staticmethod
    async def get_user(user_id):
        return await CustomUser.objects.aget(id=user_id)