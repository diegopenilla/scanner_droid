
import os
from elevenlabs_client import ElevenLabsAPI
import json
from dotenv import load_dotenv

load_dotenv()

try:
    api = ElevenLabsAPI()
    models = api.list_models()
    if models:
        print("Available Models:")
        for m in models:
            print(f"- {m['model_id']} ({m['name']})")
    else:
        print("Failed to fetch models")
except Exception as e:
    print(f"Error: {e}")




