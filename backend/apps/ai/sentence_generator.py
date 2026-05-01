"""
Generate pronunciation practice sentences from a user's prepare answers.
Uses the SmartSundae section instructions as additional context when available.
"""
import json
from .client import get_client
from apps.assessments.models import PracticeSentence
from apps.content import smartsundae

SENTENCE_COUNT = 5

SYSTEM_PROMPT = """You are a language learning assistant. Given information about a real-life scenario and a student's preparation answers, generate {count} natural, conversational sentences the student should practice saying in English. The sentences should:
- Be things the STUDENT would say (not the other person)
- Reflect the specific scenario and the student's situation
- Be useful phrases they'd realistically need in that situation
- Vary in length (mix shorter and longer sentences)

Respond with a JSON array of exactly {count} strings. No explanation, just the JSON array."""


def generate(assessment) -> list:
    answers = list(assessment.prep_answers.order_by("question_index"))
    module = assessment.module

    answers_text = "\n".join(
        f"A{i + 1}: {a.answer}" for i, a in enumerate(answers)
    )

    # Enrich with SmartSundae scenario context if available
    scenario_context = ""
    if module.external_id:
        try:
            instructions = smartsundae.get_section_instructions(module.external_id)
            if instructions:
                scenario_context = f"\nScenario context:\n{instructions[:500]}"
        except Exception:
            pass

    prompt = f"""Module: {module.title}
Section: {module.section_title}
Language: {module.language}
{scenario_context}

Student's preparation answers:
{answers_text}

Generate {SENTENCE_COUNT} practice sentences the student would say in this scenario."""

    client = get_client()
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=512,
        system=SYSTEM_PROMPT.format(count=SENTENCE_COUNT),
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    sentences = json.loads(raw)

    assessment.practice_sentences.all().delete()
    objs = [
        PracticeSentence.objects.create(assessment=assessment, index=i, sentence=s)
        for i, s in enumerate(sentences[:SENTENCE_COUNT])
    ]
    return objs
