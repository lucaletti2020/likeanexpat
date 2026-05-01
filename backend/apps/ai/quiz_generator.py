"""
Generate quiz questions from a completed conversation transcript.
"""
import json
from .client import get_client
from apps.assessments.models import QuizQuestion

QUESTION_COUNT = 4

SYSTEM_PROMPT = """You are a language learning quiz creator. Based on the conversation transcript below (student practising {language}), create {count} multiple-choice questions to test what the student learned.

Each question should test practical language use — phrasing, politeness, or vocabulary used in the conversation.

Respond with a JSON array of exactly {count} objects, each with:
{{
  "question": "<question text>",
  "answers": ["<option A>", "<option B>", "<option C>"],
  "correct_index": <0, 1, or 2>,
  "explanation": "<why the correct answer is best>"
}}

Respond with only the JSON array. No explanation."""


def generate(assessment) -> list:
    turns = assessment.conversation_turns.order_by("turn_number")
    transcript = "\n".join(
        f"{'Student' if t.speaker == 'user' else 'AI'}: {t.text}" for t in turns
    )

    module = assessment.module
    client = get_client()

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        system=SYSTEM_PROMPT.format(language=module.language, count=QUESTION_COUNT),
        messages=[{"role": "user", "content": f"Transcript:\n{transcript}"}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    questions = json.loads(raw)

    assessment.quiz_questions.all().delete()
    objs = [
        QuizQuestion.objects.create(
            assessment=assessment,
            order=i,
            question=q["question"],
            answers=q["answers"],
            correct_index=q["correct_index"],
            explanation=q["explanation"],
        )
        for i, q in enumerate(questions[:QUESTION_COUNT])
    ]
    return objs
