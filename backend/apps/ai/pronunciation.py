"""
Pronunciation assessment via Azure Speech SDK.
Returns overall score and per-word scores.
"""
import tempfile
import os
from django.conf import settings


def assess(audio_file, reference_text: str) -> dict:
    """
    audio_file: Django UploadedFile (wav/webm)
    reference_text: the sentence the user was meant to say
    Returns: {"overall_score": int, "words": [{"word": str, "score": int}]}
    """
    try:
        import azure.cognitiveservices.speech as speechsdk
    except ImportError:
        return _mock_result(reference_text)

    if not settings.AZURE_SPEECH_KEY:
        return _mock_result(reference_text)

    # Write audio to temp file
    suffix = ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        for chunk in audio_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION,
        )
        audio_config = speechsdk.AudioConfig(filename=tmp_path)

        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Word,
        )

        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config, audio_config=audio_config
        )
        pronunciation_config.apply_to(recognizer)

        result = recognizer.recognize_once()
        pa_result = speechsdk.PronunciationAssessmentResult(result)

        words = [
            {"word": w.word, "score": int(w.accuracy_score)}
            for w in pa_result.words
        ]
        overall = int(pa_result.pronunciation_score)

        return {"overall_score": overall, "words": words}
    finally:
        os.unlink(tmp_path)


def _mock_result(reference_text: str) -> dict:
    """Fallback when Azure is not configured — returns plausible mock scores."""
    import random
    words = reference_text.split()
    word_scores = [{"word": w, "score": random.randint(60, 99)} for w in words]
    overall = sum(ws["score"] for ws in word_scores) // len(word_scores)
    return {"overall_score": overall, "words": word_scores}
