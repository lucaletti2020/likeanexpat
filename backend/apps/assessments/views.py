from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.content.models import Module
from apps.content import smartsundae
from .models import (
    Assessment, PrepareAnswer, PracticeSentence,
    FeedbackReport, QuizQuestion, QuizAttempt,
)
from .serializers import (
    PracticeSentenceSerializer, FeedbackReportSerializer,
    QuizQuestionSerializer, PrepareSubmitSerializer, QuizSubmitSerializer,
)
from apps.ai import sentence_generator, feedback_generator, quiz_generator, pronunciation

PREP_QUESTIONS_TEMPLATE = [
    "Describe a recent situation you've experienced related to {topic}.",
    "What aspects of {topic} do you find most challenging to communicate in English?",
    "How do you usually handle conversations about {topic}?",
]


def _get_or_create_assessment(user, meeting_id):
    module = get_object_or_404(Module, pk=meeting_id)
    assessment, _ = Assessment.objects.get_or_create(
        user=user, module=module, defaults={"status": "preparing"}
    )
    return assessment


# ─── Prepare ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def prepare_detail(request, meeting_id):
    module = get_object_or_404(Module, pk=meeting_id)
    topic = module.title.lower()
    questions = [q.format(topic=topic) for q in PREP_QUESTIONS_TEMPLATE]
    return Response(
        {
            "module_title": module.title,
            "section_title": module.section_title,
            "questions": questions,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def prepare_submit(request, meeting_id):
    serializer = PrepareSubmitSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    answers = serializer.validated_data["answers"]

    assessment = _get_or_create_assessment(request.user, meeting_id)

    for i, answer in enumerate(answers):
        PrepareAnswer.objects.update_or_create(
            assessment=assessment, question_index=i, defaults={"answer": answer}
        )

    assessment.status = "practicing"
    assessment.save()

    sentences = sentence_generator.generate(assessment)

    return Response(
        {
            "assessment_id": assessment.id,
            "sentences": PracticeSentenceSerializer(sentences, many=True).data,
        },
        status=status.HTTP_201_CREATED,
    )


# ─── Practice ─────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def practice_sentences(request, meeting_id):
    assessment = _get_or_create_assessment(request.user, meeting_id)
    sentences = assessment.practice_sentences.all()
    return Response(PracticeSentenceSerializer(sentences, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def practice_record(request, meeting_id):
    assessment = _get_or_create_assessment(request.user, meeting_id)
    sentence_index = int(request.data.get("sentence_index", 0))
    audio_file = request.FILES.get("audio")

    sentence_obj = get_object_or_404(PracticeSentence, assessment=assessment, index=sentence_index)

    result = pronunciation.assess(audio_file, sentence_obj.sentence)

    sentence_obj.word_scores = result["words"]
    sentence_obj.overall_score = result["overall_score"]
    sentence_obj.save()

    return Response(result)


# ─── Feedback ─────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def feedback_detail(request, meeting_id, assessment_id):
    assessment = get_object_or_404(Assessment, pk=assessment_id, user=request.user)

    if not hasattr(assessment, "feedback"):
        report = feedback_generator.generate(assessment)
    else:
        report = assessment.feedback

    data = FeedbackReportSerializer(report).data
    data["module_title"] = assessment.module.title
    data["section_title"] = assessment.module.section_title
    return Response(data)


# ─── Quiz ─────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def quiz_questions(request, meeting_id):
    assessment = _get_or_create_assessment(request.user, meeting_id)

    questions = assessment.quiz_questions.all()
    if not questions.exists():
        questions = quiz_generator.generate(assessment)

    return Response(QuizQuestionSerializer(questions, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def quiz_submit(request, meeting_id):
    assessment = _get_or_create_assessment(request.user, meeting_id)
    serializer = QuizSubmitSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    selected = serializer.validated_data["selected_answers"]
    questions = list(assessment.quiz_questions.order_by("order"))

    score = sum(
        1 for i, q in enumerate(questions)
        if i < len(selected) and selected[i] == q.correct_index
    )

    attempt, _ = QuizAttempt.objects.update_or_create(
        assessment=assessment,
        defaults={"selected_answers": selected, "score": score},
    )

    assessment.status = "complete"
    assessment.save()

    return Response({"score": score, "total": len(questions)})
