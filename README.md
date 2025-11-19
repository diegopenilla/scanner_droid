# Droid Project

This project runs a Node.js server on a Raspberry Pi to control the "Droid" robot. It provides a web interface and API for controlling audio playback, video playback, and thermal printing capabilities.

## Overview

The Droid server exposes endpoints to:
- Upload and play audio files (`.wav`) using `mplayer`.
- Upload and play video files (`.mp4`, `.mov`) using `mpv`.
- Print text and images to a connected USB thermal printer.
- Manage the system service.

## Installation & Setup

### Prerequisites
- Raspberry Pi with Linux (Raspbian/Pi OS recommended).
- Node.js and npm.
- Python 3 with `escpos`, `pigpio`, and `Pillow` libraries.
- `mplayer` and `mpv` installed for media playback.
- `bluetoothctl` and `pulseaudio` for Bluetooth audio (if used).

### Setup Service
To install and enable the Droid systemd service, run the install script:

```bash
./scripts/install.sh
```

This script will:
1. Copy the `droid.service` file to `/etc/systemd/system/`.
2. Enable the service to start on boot.
3. Require a reboot to complete installation.

## Usage

### Running as a Service
The service is managed via systemd.

- **Start:** `sudo systemctl start droid`
- **Stop:** `sudo systemctl stop droid`
- **Restart:** `sudo systemctl restart droid`
- **Status:** `sudo systemctl status droid`

The service executes `scripts/run_droid_service.sh`, which starts the Node.js server.

### Manual Execution
To run the server manually (e.g., for debugging):

```bash
node server.js
```

The server runs on port **3000** by default. Access the web interface at `http://<PI_IP>:3000`.

## API Endpoints

- `GET /files`: List available audio files.
- `GET /videos`: List available video files.
- `POST /play?file=<filename>`: Play an audio file.
- `POST /playVideo?file=<filename>`: Play a video file.
- `POST /loopVideo?file=<filename>`: Loop a video file.
- `POST /stopAudio`: Stop current audio playback.
- `POST /stopVideo`: Stop current video playback.
- `POST /printText`: Print text to the thermal printer.
- `POST /printImage`: Print an image to the thermal printer.
- `POST /uploadAudio`: Upload a `.wav` file.
- `POST /uploadVideo`: Upload a `.mp4` or `.mov` file.

## File Usage

### Used Files (Active)
These files are essential for the current operation of the Droid server and service.

- **`server.js`**: The main entry point for the Node.js application. Handles all API requests and controls hardware/media.
- **`print_image.py`**: Python script called by `server.js` to handle printing text and images to the USB thermal printer.
- **`package.json`**: Defines Node.js dependencies (`express`, `multer`, etc.).
- **`scripts/run_droid_service.sh`**: Wrapper script used by the systemd service to start the server.
- **`scripts/services/droid.service`**: Systemd unit file definition.
- **`scripts/install.sh`**: Script to install and enable the systemd service.
- **`public/`**: Directory containing the web frontend assets (`index.html`, `app.js`, css, libs).
- **`voices/`**: Directory where uploaded audio files are stored.
- **`videos/`**: Directory where uploaded video files are stored.

### Not Used (Legacy / Manual Tools / Testing)
These files are not part of the main automated service flow but may be used for testing or reference. They have been moved to `scripts/utilities/`.

- **`scripts/utilities/printer.py`**: Manual tool to test printing text (uses `escpos` like the server).
- **`scripts/utilities/audio.sh`**: Manual tool to play audio files (uses `mplayer`).
- **`scripts/utilities/run_vid.sh`**: Manual tool to play video files (uses `mpv`).
- **`scripts/utilities/clear_screen.sh`**: Tool to clear the screen/framebuffer using `mpv`.
- **`scripts/utilities/connect_be.sh`**: Script for manual Bluetooth connection setup.
- **`scripts/utilities/rc_pwm_trigger.py`**: Standalone Python script for reading RC PWM signals.
- **`scripts/utilities/signal_reader.py`**: Standalone Python script for reading pulse widths from GPIO.
- **`server_old.js`**: Legacy version of the server code (in root).
- **`printer_instructions.md`**: Documentation/notes regarding the printer.
- **`steps.md`**: Development notes/checklist.

