from django.core.management.base import BaseCommand
from users.models import CustomUser
import os

class Command(BaseCommand):
    help = 'Creates a superuser from environment variables'

    def handle(self, *args, **kwargs):
        username = os.environ.get('ADMIN_USER')
        password = os.environ.get('ADMIN_PASS')
        email = os.environ.get('ADMIN_EMAIL', '') # Email is optional

        if not all([username, password]):
            self.stdout.write(self.style.ERROR('ADMIN_USER and ADMIN_PASS environment variables are required.'))
            return

        if CustomUser.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" already exists.'))
        else:
            CustomUser.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser "{username}"'))