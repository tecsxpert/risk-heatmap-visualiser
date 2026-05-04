from flask import Blueprint, jsonify
import time
from services.vector_store import collection
from services.cache import get_stats

health_bp = Blueprint("health", __name__)

start_time = time.time()

@health_bp.route("/health", methods=["GET"])
def health():

    uptime = time.time() - start_time

    return jsonify({
        "model": "llama-3.3-70b-versatile",
        "cache": get_stats(),
        "uptime_seconds": round(uptime, 2),
        "chroma_count": collection.count(),
        "status": "OK"
    })