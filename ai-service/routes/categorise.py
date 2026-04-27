from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
import json

categorise_bp = Blueprint("categorise", __name__)

@categorise_bp.route("/categorise", methods=["POST"])
def categorise():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    user_text = data["text"]

    prompt = f"""
    You are an AI risk classification system.

Classify the following text into ONE of these categories:
Cybersecurity, Financial, Operational, Compliance, Reputational

Return ONLY valid JSON. Do NOT add any explanation outside JSON.

Format:
{{
  "category": "<one category>",
  "confidence": <number between 0 and 1>,
  "reasoning": "<short explanation>"
}}

    Text: {user_text}
    """

    response = GroqClient.generate_response([
        {"role": "user", "content": prompt}
    ])

    try:
        parsed = json.loads(response)
        return jsonify(parsed)
    except Exception:
        return jsonify({
            "category": "Unknown",
            "confidence": 0.0,
            "reasoning": "Failed to parse AI response"
        })