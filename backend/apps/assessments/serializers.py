from rest_framework import serializers
from .models import (
    Assessment, PrepareAnswer, PracticeSentence,
    ConversationTurn, FeedbackReport, QuizQuestion, QuizAttempt,
)


class PrepareAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrepareAnswer
        fields = ("question_index", "answer")


class PracticeSentenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeSentence
        fields = ("id", "index", "sentence", "audio_url", "word_scores", "overall_score")


class ConversationTurnSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationTurn
        fields = ("turn_number", "speaker", "text", "timestamp")


class FeedbackReportSerializer(serializers.ModelSerializer):
    transcript = ConversationTurnSerializer(source="assessment.conversation_turns", many=True, read_only=True)

    class Meta:
        model = FeedbackReport
        fields = ("overall_score", "performance_label", "skills", "strengths", "improvements", "transcript", "created_at")


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ("id", "question", "answers", "correct_index", "explanation", "order")


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ("selected_answers", "score", "created_at")


class PrepareSubmitSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.CharField())


class QuizSubmitSerializer(serializers.Serializer):
    selected_answers = serializers.ListField(child=serializers.IntegerField())
