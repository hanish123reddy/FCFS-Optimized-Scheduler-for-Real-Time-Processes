import os
from flask import Flask
from flask_cors import CORS
from config import Config
from routes import api_bp

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes under /api and general CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    CORS(app)

    # Register blueprints (routes)
    app.register_blueprint(api_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=app.config['DEBUG'], host='0.0.0.0', port=port)

