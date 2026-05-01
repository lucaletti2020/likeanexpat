from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .models import UserProfile
from .serializers import RegisterSerializer, OnboardingSerializer
from apps.assessments.models import Assessment


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    credential = request.data.get("credential")
    if not credential:
        return Response({"detail": "No credential provided."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    email = info.get("email")
    if not email:
        return Response({"detail": "Google account has no email."}, status=status.HTTP_400_BAD_REQUEST)

    username = email.split("@")[0]
    user, created = User.objects.get_or_create(email=email, defaults={"username": username})
    if created:
        user.set_unusable_password()
        user.save()
        UserProfile.objects.create(user=user)

    refresh = RefreshToken.for_user(user)
    return Response(
        {"access": str(refresh.access_token), "refresh": str(refresh)},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response(
        {"access": str(refresh.access_token), "refresh": str(refresh)},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username") or request.data.get("email")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def onboarding(request):
    serializer = OnboardingSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.language = data["language"]
    profile.level = data["level"]
    profile.situations = data["situations"]
    profile.save()
    return Response({"detail": "Preferences saved."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def progress(request):
    """Return the user's learning journey progress for the Dashboard."""
    from apps.content.models import Collection, Module
    from apps.content.serializers import CollectionSerializer

    collections = Collection.objects.prefetch_related("modules").all()
    result = []
    for col in collections:
        modules_data = []
        for mod in col.modules.all():
            assessment = (
                Assessment.objects.filter(user=request.user, module=mod)
                .order_by("-created_at")
                .first()
            )
            status_val = "not_started"
            if assessment:
                status_val = "done" if assessment.status == "complete" else "in_progress"
            modules_data.append(
                {
                    "id": mod.id,
                    "title": mod.title,
                    "section_title": mod.section_title,
                    "status": status_val,
                }
            )
        result.append({"id": col.id, "name": col.name, "icon": col.icon, "color": col.color, "modules": modules_data})

    completed = Assessment.objects.filter(user=request.user, status="complete").count()
    total = Assessment.objects.filter(user=request.user).count()

    return Response({"sections": result, "stats": {"sessions": total, "completed": completed}})
