from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        UserProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("language", "level", "situations")


class OnboardingSerializer(serializers.Serializer):
    language = serializers.CharField(max_length=64)
    level = serializers.CharField(max_length=64)
    situations = serializers.ListField(child=serializers.CharField())
