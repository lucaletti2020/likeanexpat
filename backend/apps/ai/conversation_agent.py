"""
Manages the real-time Claude conversation for the Simulate page.
Uses SmartSundae section instructions as the AI system prompt when available.
"""
import anthropic
from django.conf import settings
from channels.db import database_sync_to_async

MODEL = "claude-opus-4-7"

FALLBACK_PROMPT = """You are a native English speaker in the following scenario: {section} — {title}.

Your role:
- Play the other person in this real-life situation
- Respond naturally and conversationally
- Keep responses concise (1-3 sentences)
- Be encouraging and helpful

Start by greeting the student and setting the scene."""


def _build_system_prompt(assessment, section_instructions: str = "") -> str:
    module = assessment.module
    if section_instructions:
        return section_instructions
    return FALLBACK_PROMPT.format(
        section=module.section_title,
        title=module.title,
    )


@database_sync_to_async
def get_greeting(assessment, section_instructions: str = "") -> str:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model=MODEL,
        max_tokens=256,
        system=_build_system_prompt(assessment, section_instructions),
        messages=[{"role": "user", "content": "Start the conversation."}],
    )
    return response.content[0].text


async def stream_response(assessment, user_message: str, section_instructions: str = ""):
    """Async generator that yields text chunks from Claude."""

    @database_sync_to_async
    def get_history():
        turns = assessment.conversation_turns.order_by("turn_number")
        messages = []
        for turn in turns:
            role = "assistant" if turn.speaker == "ai" else "user"
            messages.append({"role": role, "content": turn.text})
        return messages

    history = await get_history()
    history.append({"role": "user", "content": user_message})

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    with client.messages.stream(
        model=MODEL,
        max_tokens=256,
        system=_build_system_prompt(assessment, section_instructions),
        messages=history,
    ) as stream:
        for text in stream.text_stream:
            yield text
