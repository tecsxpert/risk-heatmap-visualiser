from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from routes.test_route import test_bp

app = Flask(__name__)

# Rate limiter — 30 requests per minute default
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["30 per minute"],
    storage_uri="memory://"
)

app.register_blueprint(test_bp)

@app.route("/health", methods=["GET"])
def health():
    return {
        "status": "ok",
        "service": "ai-service",
        "port": 5000
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)