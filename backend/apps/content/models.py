from django.db import models


class Collection(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=64, default="BookOpen")
    color = models.CharField(max_length=128, default="from-blue-500 to-cyan-600")
    order = models.PositiveIntegerField(default=0)
    external_id = models.CharField(max_length=100, blank=True, default="", db_index=True)
    code = models.CharField(max_length=100, blank=True, default="")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Module(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=256)
    section_title = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    language = models.CharField(max_length=64, default="English")
    level = models.CharField(max_length=64, default="Beginner")
    prep_questions = models.JSONField(default=list)
    order = models.PositiveIntegerField(default=0)
    external_id = models.CharField(max_length=100, blank=True, default="", db_index=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title
