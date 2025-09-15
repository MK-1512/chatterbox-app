from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'is_staff', 'is_superuser']
    # Add the custom 'avatar' field to the admin form
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('avatar',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('avatar',)}),
    )

# Unregister the default User admin if it exists, then register our custom one
# admin.site.unregister(User) # This line is often not needed
admin.site.register(CustomUser, CustomUserAdmin)