# Video Display Scripts

This directory contains scripts for video playback and display management.

## Files:

- **`clear_screen.sh`** - Clears the framebuffer display by playing a single black frame
- **`run_vid.sh`** - Plays a looped video with audio and then clears the screen
  - Plays: `./videos/two_laser_stripes_video.mp4` in loop with audio
  - Displays: `./videos/black_frame.mp4` as single frame to clear screen

## Requirements:
- mplayer installed
- Access to framebuffer device (`/dev/fb0`)
- Video files in the specified paths
- ALSA audio system

## Usage:
```bash
# Clear screen
./clear_screen.sh

# Run video sequence
./run_vid.sh
```

## Configuration:
- Videos are scaled to 720x480 resolution
- Audio output via ALSA
- Display output to framebuffer (/dev/fb0) 