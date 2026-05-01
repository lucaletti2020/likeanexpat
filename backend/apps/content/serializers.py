from rest_framework import serializers
from .models import Collection, Module


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ("id", "title", "section_title", "description", "language", "level", "collection", "external_id", "order")


class CollectionSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ("id", "name", "description", "icon", "color", "order", "modules", "external_id", "code")
