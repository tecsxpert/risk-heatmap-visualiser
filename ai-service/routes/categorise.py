from services.cache import get_cached, set_cache
from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
from services.vector_store import store_risk
import time 
import json

categorise_bp = Blueprint("categorise", __name__)

@categorise_bp.route("/categorise", methods=["POST"])
def categorise():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    user_text = data["text"]
    start_time = time.time()
    # Check cache first
    cached = get_cached(user_text)
    print("CACHE RESULT:", cached)
    if cached:
        cached_copy = dict(cached)  # avoid mutating stored data
        cached_copy["meta"]["cached"] = True
        return jsonify(cached_copy)

    prompt = f"""
    You are a risk analysis AI.

Analyze the following text and return STRICT JSON ONLY.

Text:
"{user_text}"

Return ONLY this JSON format:
{{
  "category": "<Financial | Cybersecurity | Operational | Compliance | Reputational>",
  "confidence": <0 to 1>,
  "severity": "<Low | Medium | High>",
  "impact": <1 to 5>,
  "reasoning": "<short explanation>"
}}

Rules:
- Do NOT add any extra text
- Do NOT explain anything outside JSON
- Do NOT use markdown (no ``` )
- Output MUST be valid JSON only
    """

    ai_response = GroqClient.generate_response([
        {"role": "user", "content": prompt}
    ])
    response_text = ai_response["content"]
    tokens_used = ai_response.get("tokens", 0)

    try:
        
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "").replace("```", "").strip()

        if "{" in cleaned:
            cleaned = cleaned[cleaned.index("{"):]

        parsed = json.loads(cleaned)    

        response_time = int((time.time() - start_time) * 1000)
        parsed["meta"]= {
            "confidence": parsed.get("confidence", 0),
            "model_used": "llama-3.3-70b-versatile",
            "tokens_used": tokens_used,
            "response_time_ms": response_time,
            "cached": False
        }
        print("👉 BEFORE CACHE STORE")   # DEBUG
        set_cache(user_text, parsed)
        print("👉 AFTER CACHE STORE")    # DEBUG
        store_risk(user_text, parsed)
        return jsonify(parsed)
    except Exception:
        return jsonify({
            "category": "Unknown",
            "confidence": 0.0,
            "reasoning": "Failed to parse AI response",
            "meta": {
                "confidence": 0,
                "model_used": "llama-3.3-70b-versatile",
                "tokens_used": 0,
                "response_time_ms": 0,
                "cached": False
            }
            })