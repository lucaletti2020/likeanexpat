import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from apps.content.models import Module
from apps.content import smartsundae
from .models import Assessment, ConversationTurn
from apps.ai import conversation_agent


class SimulateConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.meeting_id = self.scope["url_route"]["kwargs"]["meeting_id"]
        self.user = self.scope.get("user")

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.assessment = await self._get_or_create_assessment()

        # Fetch SmartSundae scenario instructions for the module
        self.section_instructions = await self._get_section_instructions()

        await self.accept()

        await self.send(json.dumps({"type": "session_info", "assessment_id": self.assessment.id}))

        greeting = await conversation_agent.get_greeting(
            self.assessment, self.section_instructions
        )
        await self._save_turn("ai", greeting)
        await self.send(json.dumps({"type": "ai_message", "text": greeting}))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_text = data.get("text", "").strip()
        if not user_text:
            return

        turn_number = await self._next_turn_number()
        await self._save_turn("user", user_text, turn_number)

        full_response = ""
        async for chunk in conversation_agent.stream_response(
            self.assessment, user_text, self.section_instructions
        ):
            full_response += chunk
            await self.send(json.dumps({"type": "ai_chunk", "text": chunk}))

        await self._save_turn("ai", full_response, turn_number + 1)
        await self.send(json.dumps({"type": "ai_done", "text": full_response}))

    @database_sync_to_async
    def _get_or_create_assessment(self):
        module = Module.objects.get(pk=self.meeting_id)
        assessment, _ = Assessment.objects.get_or_create(
            user=self.user, module=module, defaults={"status": "simulating"}
        )
        if assessment.status == "practicing":
            assessment.status = "simulating"
            assessment.save()
        return assessment

    async def _get_section_instructions(self) -> str:
        """Fetch SmartSundae scenario instructions (uses cache, no DB hit after first call)."""
        try:
            module = await database_sync_to_async(
                lambda: Module.objects.get(pk=self.meeting_id)
            )()
            if module.external_id:
                return smartsundae.get_section_instructions(module.external_id)
        except Exception:
            pass
        return ""

    @database_sync_to_async
    def _next_turn_number(self):
        last = self.assessment.conversation_turns.order_by("-turn_number").first()
        return (last.turn_number + 1) if last else 1

    @database_sync_to_async
    def _save_turn(self, speaker, text, turn_number=None):
        if turn_number is None:
            last = self.assessment.conversation_turns.order_by("-turn_number").first()
            turn_number = (last.turn_number + 1) if last else 1
        ConversationTurn.objects.create(
            assessment=self.assessment,
            turn_number=turn_number,
            speaker=speaker,
            text=text,
        )
