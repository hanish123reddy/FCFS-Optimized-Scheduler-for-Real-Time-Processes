import os

class Config:
    """Base configuration class."""
    # Debug mode is enabled by default for development
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
