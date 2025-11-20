# Droid Project

This project runs a Node.js server on a Raspberry Pi to control the "Droid" robot. It provides a web interface and API for controlling audio playback, video playback, thermal printing, and ElevenLabs Text-to-Speech (TTS).

## Overview

The Droid server exposes endpoints to:
- Upload and play audio files (`.wav`) using `mplayer`.
- Upload and play video files (`.mp4`, `.mov`) using `mpv`.
- Print text and images to a connected USB thermal printer.
- **New:** Generate speech from text using ElevenLabs API (requires `.env` with API key).
- Manage the system service.

## Installation & Setup

### Prerequisites
- Raspberry Pi with Linux (Raspbian/Pi OS recommended).
- Node.js and npm.
- Python 3 with `escpos`, `pigpio`, `Pillow`, `requests`, `python-dotenv`.
- `mplayer` and `mpv` installed for media playback.

### Configuration
Create a `.env` file in the `Droid/` directory with your API keys:
```bash
ELEVEN_LABS_API_KEY=your_api_key_here
```

### Media Players Installation
```bash
sudo apt-get install mplayer mpv
```

### Setup Service
To install and enable the Droid systemd service, run the install script:
```bash
./scripts/install.sh
```

## Usage

### Manual Execution
```bash
node server.js
```
Access the web interface at `http://<PI_IP>:3000`.

## API Endpoints

- `GET /files`: List available audio files.
- `POST /play?file=<filename>`: Play an audio file.
- `POST /printText`: Print text to the thermal printer.
- `GET /tts/voices`: List available ElevenLabs voices.
- `POST /tts/generate`: Generate audio from text (saves to `voices/`).

## Key Files

- **`server.js`**: Main Node.js application.
- **`droid_tts.py`**: Bridge script for ElevenLabs TTS operations.
- **`elevenlabs_client.py`**: Standalone Python client for ElevenLabs API (decoupled from Wattson).
- **`print_image.py`**: Printer control script.
- **`public/`**: Web frontend assets.
