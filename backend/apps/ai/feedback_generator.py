"""
Generate a FeedbackReport from a completed conversation assessment.
"""
import json
from .client import get_client
from apps.assessments.models import FeedbackReport

SYSTEM_PROMPT = """You are a language learning coach. Analyse the following conversation transcript between a student and a native speaker AI. The student is learning {language} at {level} level.

Provide feedback as a JSON object with this exact structure:
{{
  "overall_score": <float 0-10>,
  "performance_label": "<e.g. Good Performance>",
  "skills": [
    {{"name": "Clarity", "score": <float 0-10>}},
    {{"name": "Vocabulary", "score": <float 0-10>}},
    {{"name": "Grammar", "score": <float 0-10>}},
    {{"name": "Fluency", "score": <float 0-10>}}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}}

Respond with only valid JSON. No explanation."""


def generate(assessment) -> FeedbackReport:
    turns = assessment.conversation_turns.order_by("turn_number")
    transcript = "\n".join(
        f"{'Student' if t.speaker == 'user' else 'AI'}: {t.text}" for t in turns
    )

    module = assessment.module
    client = get_client()

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=512,
        system=SYSTEM_PROMPT.format(language=module.language, level=module.level),
        messages=[{"role": "user", "content": f"Transcript:\n{transcript}"}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    data = json.loads(raw)

    report, _ = FeedbackReport.objects.update_or_create(
        assessment=assessment,
        defaults={
            "overall_score": data["overall_score"],
            "performance_label": data.get("performance_label", ""),
            "skills": data["skills"],
            "strengths": data["strengths"],
            "improvements": data["improvements"],
        },
    )
    return report
