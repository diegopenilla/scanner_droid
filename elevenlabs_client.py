#!/usr/bin/env python3
"""
ElevenLabs API Interface (Droid Standalone)
===========================================
Copied from core/elevenlabs_api.py for standalone Droid operation.
"""

import os
import requests
import json
import base64
import subprocess
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load .env from the current directory (Droid)
load_dotenv()

logger = logging.getLogger(__name__)

class ElevenLabsAPI:
    """Handles all ElevenLabs API operations including voice generation and alignment."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize ElevenLabs API client."""
        self.api_key = api_key or os.getenv("ELEVEN_LABS_API_KEY")
        if not self.api_key:
            raise ValueError("ELEVEN_LABS_API_KEY must be provided or set in environment")

        self.base_url = "https://api.elevenlabs.io"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }

    def create_voice_with_alignment(
        self,
        text: str,
        output_name: str = "output",
        output_format: str = "pcm_44100",
        model_id: str = "eleven_v3",
        voice_id: str = "DkWNPTSXKQoAVJXP1kFP",
        write_timing_file: bool = True,
        output_dir: str = "outputs",
    ) -> Optional[Dict[str, Any]]:
        logger.info(f"Creating voice: '{text}' with format {output_format}")
        os.makedirs(output_dir, exist_ok=True)
        models_to_try = self._get_models_to_try(model_id)

        response = None
        for model in models_to_try:
            logger.debug(f"Trying model: {model}")
            response = requests.post(
                f"{self.base_url}/v1/text-to-speech/{voice_id}/with-timestamps",
                headers=self.headers,
                json={
                    "text": text,
                    "model_id": model,
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.1},
                    "output_format": output_format
                }
            )

            if response.status_code == 200:
                logger.info(f"Using model: {model}")
                break
            elif "not found" in response.text.lower() or "invalid" in response.text.lower():
                logger.warning(f"Model {model} not available, trying next...")
                continue
            else:
                logger.error(f"API Error with {model}: {response.text}")
                break

        if response.status_code != 200:
            logger.error(f"API Error: {response.text}")
            return None

        result = response.json()
        audio_data = base64.b64decode(result['audio_base64'])
        audio_file = self._save_audio_file(audio_data, output_name, output_format, output_dir)
        if not audio_file:
            return None

        timing_data = self._create_timing_data(text, result['alignment'])
        timing_file = f"{output_dir}/{output_name}_timing.json"

        if write_timing_file:
            with open(timing_file, 'w') as f:
                json.dump(timing_data, f, indent=2)
            logger.info(f"Voice generation complete: {audio_file}, {timing_file}")
        else:
            timing_file = None
            logger.info(f"Voice generation complete: {audio_file}")

        return {
            'audio_file': audio_file,
            'timing_file': timing_file,
            'timing_data': timing_data
        }

    def analyze_audio_with_forced_alignment(
        self, 
        audio_file: str, 
        text: str, 
        output_name: str = "alignment",
        output_dir: str = "outputs"
    ) -> Optional[Dict[str, Any]]:
        logger.info(f"Analyzing audio: {audio_file} with text: '{text}'")
        if not os.path.exists(audio_file):
            logger.error(f"Audio file not found: {audio_file}")
            return None

        with open(audio_file, 'rb') as f:
            audio_data = f.read()

        files = {'file': (audio_file, audio_data, 'audio/wav')}
        data = {'text': text}
        headers = {'xi-api-key': self.api_key}

        response = requests.post(
            f"{self.base_url}/v1/forced-alignment",
            headers=headers,
            data=data,
            files=files
        )

        if response.status_code != 200:
            logger.error(f"Forced Alignment Error: {response.text}")
            return None

        result = response.json()
        alignment_file = f"{output_dir}/{output_name}_forced_alignment.json"
        with open(alignment_file, 'w') as f:
            json.dump(result, f, indent=2)

        timing_data = self._convert_alignment_to_timing(result, text)
        timing_file = None

        if timing_data:
            timing_file = f"{output_dir}/{output_name}_timing.json"
            with open(timing_file, 'w') as f:
                json.dump(timing_data, f, indent=2)

        logger.info(f"Forced alignment complete: {alignment_file}")

        return {
            'alignment_file': alignment_file,
            'timing_file': timing_file,
            'timing_data': timing_data,
            'alignment_data': result
        }

    def generate_speech_with_emotion(
        self,
        text: str,
        voice_id: str = "BTvPPGf0QT4zNg7UeIhJ",
        output_file: Optional[str] = None,
        stability: float = 0.3,
        similarity_boost: float = 0.8,
        style: float = 0.4,
        output_format: str = "pcm_44100",
        model_id: str = "eleven_v3"
    ) -> Optional[bytes]:
        logger.info(f"Generating emotional speech with voice {voice_id}")
        url = f"{self.base_url}/v1/text-to-speech/{voice_id}"
        params = {"output_format": output_format}

        payload = {
            "text": text,
            "model_id": model_id,
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost,
                "style": style
            }
        }

        try:
            response = requests.post(url, headers=self.headers, json=payload, params=params)
            response.raise_for_status()
            audio_data = response.content

            if output_file:
                if output_format.startswith("pcm") and not output_file.endswith('.wav'):
                    output_file = output_file.replace('.mp3', '.wav')
                with open(output_file, 'wb') as f:
                    f.write(audio_data)
                logger.info(f"Audio saved to: {output_file}")

            return audio_data

        except requests.exceptions.RequestException as e:
            logger.error(f"Error generating speech: {e}")
            return None

    def list_voices(
        self, 
        search: Optional[str] = None, 
        voice_type: Optional[str] = None, 
        category: Optional[str] = None, 
        page_size: int = 100
    ) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v2/voices"
        params = {
            "page_size": min(page_size, 100),
            "include_total_count": True
        }
        if search: params["search"] = search
        if voice_type: params["voice_type"] = voice_type
        if category: params["category"] = category

        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error listing voices: {e}")
            return None

    def get_voice_details(self, voice_id: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v1/voices/{voice_id}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting voice details: {e}")
            return None

    def list_models(self) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v1/models"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error listing models: {e}")
            return None

    def _get_models_to_try(self, model_id: str) -> list:
        if "v3" in model_id.lower():
            return ["eleven_v3"]
        else:
            return [model_id]

    def _save_audio_file(self, audio_data: bytes, output_name: str, output_format: str, output_dir: str = "outputs") -> Optional[str]:
        if output_format.startswith('pcm_'):
            audio_file = f"{output_dir}/{output_name}.wav"
            with open(audio_file, 'wb') as f:
                f.write(audio_data)
            return audio_file
        else:
            ext = 'wav' if 'pcm' in output_format else 'audio'
            audio_file = f"{output_dir}/{output_name}.{ext}"
            with open(audio_file, 'wb') as f:
                f.write(audio_data)
            return audio_file

    def _create_timing_data(self, text: str, alignment: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'text': text,
            'characters': alignment['characters'],
            'start_times': alignment['character_start_times_seconds'],
            'end_times': alignment['character_end_times_seconds']
        }

    def _convert_alignment_to_timing(self, alignment_data: Dict[str, Any], text: str) -> Optional[Dict[str, Any]]:
        try:
            top_level_chars = alignment_data.get('characters')
            if isinstance(top_level_chars, list) and all(isinstance(c, dict) for c in top_level_chars):
                characters_str = ''.join(c.get('text', '') for c in top_level_chars)
                start_times = []
                end_times = []
                for c in top_level_chars:
                    start_val = c.get('start')
                    end_val = c.get('end')
                    try:
                        start_times.append(float(start_val) if start_val is not None else 0.0)
                    except Exception:
                        start_times.append(0.0)
                    try:
                        end_times.append(float(end_val) if end_val is not None else (start_times[-1]))
                    except Exception:
                        end_times.append(start_times[-1])

                return {
                    'text': text,
                    'characters': characters_str,
                    'start_times': start_times,
                    'end_times': end_times,
                }

            if 'alignment' in alignment_data and isinstance(alignment_data['alignment'], dict):
                alignment = alignment_data['alignment']
                characters = alignment.get('characters', [])
                if isinstance(characters, list):
                    characters = ''.join(characters)
                start_times = alignment.get('character_start_times_seconds') or alignment.get('start_times') or []
                end_times = alignment.get('character_end_times_seconds') or alignment.get('end_times') or []
                return {
                    'text': text,
                    'characters': characters,
                    'start_times': start_times,
                    'end_times': end_times,
                }

            logger.warning("No character-level timing found in alignment data")
            return None

        except Exception as e:
            logger.error(f"Error converting alignment: {e}")
            return None
