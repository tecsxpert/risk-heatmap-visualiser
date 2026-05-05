from flask import Flask, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from routes.test_route import test_bp

app = Flask(__name__)

# Security headers — fixes ZAP findings
talisman = Talisman(
    app,
    force_https=False,
    strict_transport_security=False,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self'",
        'style-src': "'self'",
        'img-src': "'self'",
        'font-src': "'self'",
        'connect-src': "'self'",
        'frame-ancestors': "'none'"
    },
    x_content_type_options=True,
    frame_options='DENY',
    referrer_policy='strict-origin-when-cross-origin'
)

# Rate limiter — 30 requests per minute default
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["30 per minute"],
    storage_uri="memory://"
)

# Custom 429 error handler with retry_after
@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({
        "error": "Rate limit exceeded",
        "code": "RATE_LIMIT_EXCEEDED",
        "retry_after": "60 seconds"
    }), 429

app.register_blueprint(test_bp)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "ai-service",
        "port": 5000
    })

@app.route("/generate-report", methods=["POST"])
@limiter.limit("10 per minute")
def generate_report():
    data = request.get_json()
    text = data.get("text", "") if data else ""

    from routes.sanitise import sanitise_input
    clean_text, error = sanitise_input(text)
    if error:
        return error

    return jsonify({
        "message": "Report endpoint — AI logic coming soon",
        "status": "ok",
        "clean_input": clean_text
    }), 200

if __name__ == "__main__":
    app.run(debug=True)