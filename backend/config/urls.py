from django.contrib import admin
from django.urls import path, include, re_path
from django.http import FileResponse
import os
from django.conf import settings


def spa_view(request, path=""):
    index_path = os.path.join(settings.WHITENOISE_ROOT, "index.html")
    return FileResponse(open(index_path, "rb"), content_type="text/html")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.auth_urls")),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.content.urls")),
    path("api/", include("apps.assessments.urls")),
    re_path(r"^(?!api/|ws/|admin/).*$", spa_view),
]
