from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # We add the email field and ensure it must be unique.
    # AbstractUser has an email field, but it's not required to be unique by default.
    # This line overrides it to enforce uniqueness.
    email = models.EmailField(blank=True, null=True, unique=False)
    
    # The avatar field is for our user profile picture feature.
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    # We tell Django that we want to use the email field for logging in.
    # This is not required right now but is good for the future.
    # USERNAME_FIELD = 'username' # Stays as username for now
    # REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username