from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("google/", views.google_login),
    path("register/", views.register),
    path("login/", views.login),
    path("token/refresh/", TokenRefreshView.as_view()),
]
