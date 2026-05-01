from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Collection, Module
from .serializers import CollectionSerializer, ModuleSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def collections_list(request):
    qs = Collection.objects.prefetch_related("modules").all()
    return Response(CollectionSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def modules_list(request):
    collection_id = request.query_params.get("collection")
    qs = Module.objects.select_related("collection").all()
    if collection_id:
        qs = qs.filter(collection_id=collection_id)
    return Response(ModuleSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def meeting_detail(request, meeting_id):
    try:
        module = Module.objects.select_related("collection").get(pk=meeting_id)
    except Module.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(
        {
            "id": module.id,
            "title": module.title,
            "section": module.section_title,
            "description": module.description,
            "language": module.language,
            "level": module.level,
            "external_id": module.external_id,
        }
    )
