from django.db import models
from django.contrib.auth.models import User
from apps.content.models import Module


class Assessment(models.Model):
    STATUS_CHOICES = [
        ("preparing", "Preparing"),
        ("practicing", "Practicing"),
        ("simulating", "Simulating"),
        ("complete", "Complete"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assessments")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="assessments")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="preparing")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} – {self.module.title}"


class PrepareAnswer(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="prep_answers")
    question_index = models.PositiveSmallIntegerField()
    answer = models.TextField()

    class Meta:
        unique_together = ("assessment", "question_index")


class PracticeSentence(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="practice_sentences")
    index = models.PositiveSmallIntegerField()
    sentence = models.TextField()
    audio_url = models.URLField(blank=True)
    word_scores = models.JSONField(default=list)  # [{"word": str, "score": int}]
    overall_score = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["index"]


class ConversationTurn(models.Model):
    SPEAKER_CHOICES = [("ai", "AI"), ("user", "User")]
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="conversation_turns")
    turn_number = models.PositiveSmallIntegerField()
    speaker = models.CharField(max_length=8, choices=SPEAKER_CHOICES)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["turn_number"]


class FeedbackReport(models.Model):
    assessment = models.OneToOneField(Assessment, on_delete=models.CASCADE, related_name="feedback")
    overall_score = models.FloatField(default=0)  # 0–10
    performance_label = models.CharField(max_length=64, blank=True)
    skills = models.JSONField(default=list)       # [{"name": str, "score": float}]
    strengths = models.JSONField(default=list)    # [str]
    improvements = models.JSONField(default=list) # [str]
    created_at = models.DateTimeField(auto_now_add=True)


class QuizQuestion(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="quiz_questions")
    question = models.TextField()
    answers = models.JSONField(default=list)      # [str, str, str]
    correct_index = models.PositiveSmallIntegerField()
    explanation = models.TextField()
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]


class QuizAttempt(models.Model):
    assessment = models.OneToOneField(Assessment, on_delete=models.CASCADE, related_name="quiz_attempt")
    selected_answers = models.JSONField(default=list)  # [int] — selected index per question
    score = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
