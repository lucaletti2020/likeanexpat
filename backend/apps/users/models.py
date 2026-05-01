from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    language = models.CharField(max_length=64, blank=True)
    level = models.CharField(max_length=64, blank=True)
    situations = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.username} profile"
