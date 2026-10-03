"""
FastAPI Router for IndicTrans2 Smart Farming Translation API
Provides single, batch, and structured AI response translation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import sys

# Ensure translation_service path is accessible
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from languages import LANGUAGES, LANGUAGE_METADATA
from translator import indic_translator

router = APIRouter(prefix="/api/translate", tags=["Translation"])

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    source: str = Field("en", description="Source language ISO code (e.g. en, hi)")
    target: str = Field("hi", description="Target language ISO code (e.g. hi, mr, gu, te, ta, kn, pa)")

class BatchTranslationRequest(BaseModel):
    texts: List[str]
    source: str = "en"
    target: str = "hi"

class StructuredTranslationRequest(BaseModel):
    data: Dict[str, Any]
    source: str = "en"
    target: str = "hi"

@router.get("/health")
def translation_health():
    return {
        "status": "ok",
        "service": "indictrans2",
        "model_type": indic_translator.model_type,
        "supported_languages": len(LANGUAGES)
    }

@router.get("/languages")
def get_languages():
    return {
        "languages": LANGUAGES,
        "metadata": LANGUAGE_METADATA
    }

@router.post("")
@router.post("/")
def translate_text(req: TranslationRequest):
    if req.source not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported source language: {req.source}")
    if req.target not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported target language: {req.target}")

    source_lang = LANGUAGES[req.source]
    target_lang = LANGUAGES[req.target]

    translated = indic_translator.translate_paragraph(req.text, source_lang, target_lang)

    return {
        "source": req.source,
        "target": req.target,
        "source_code": source_lang,
        "target_code": target_lang,
        "original": req.text,
        "translated": translated
    }

@router.post("/batch")
def translate_batch(req: BatchTranslationRequest):
    if req.source not in LANGUAGES or req.target not in LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported source or target language")

    source_lang = LANGUAGES[req.source]
    target_lang = LANGUAGES[req.target]

    results = [
        indic_translator.translate_paragraph(t, source_lang, target_lang)
        for t in req.texts
    ]

    return {
        "source": req.source,
        "target": req.target,
        "translations": results
    }

@router.post("/structured")
def translate_structured(req: StructuredTranslationRequest):
    if req.source not in LANGUAGES or req.target not in LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported source or target language")

    translated_data = indic_translator.translate_structured(req.data, req.source, req.target)
    return {
        "source": req.source,
        "target": req.target,
        "data": translated_data
    }
