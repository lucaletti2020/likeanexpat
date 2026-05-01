from django.urls import path
from . import views

urlpatterns = [
    path("user/onboarding/", views.onboarding),
    path("user/progress/", views.progress),
]
