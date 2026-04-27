from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
import json

batch_bp = Blueprint("batch", __name__)

@batch_bp.route("/batch-categorise", methods=["POST"])
def batch_categorise():

    data = request.get_json()

    if not data or "texts" not in data:
        return jsonify({"error": "Missing 'texts' field"}), 400

    texts = data["texts"]

    results = []

    for text in texts:

        prompt = f"""
        You are an AI risk classification system.

        Classify the following text into ONE of these categories:
        Cybersecurity, Financial, Operational, Compliance, Reputational

        Return ONLY valid JSON:
        {{
          "category": "<one category>",
          "confidence": <0 to 1>,
          "reasoning": "<short explanation>"
        }}

        Text: {text}
        """

        response = GroqClient.generate_response([
            {"role": "user", "content": prompt}
        ])

        try:
            cleaned = response.strip().replace("```json", "").replace("```", "")
            parsed = json.loads(cleaned)
        except:
            parsed = {
                "category": "Unknown",
                "confidence": 0.0,
                "reasoning": "Failed to parse AI response"
            }

        results.append(parsed)

    return jsonify(results)