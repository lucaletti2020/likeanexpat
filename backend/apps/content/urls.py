from django.urls import path
from . import views

urlpatterns = [
    path("collections/", views.collections_list),
    path("modules/", views.modules_list),
    path("meetings/<int:meeting_id>/", views.meeting_detail),
]
