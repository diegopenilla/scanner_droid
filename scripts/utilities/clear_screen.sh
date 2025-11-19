#!/bin/bash
# Clears screen by playing a black frame (using mpv)

VIDEO_PATH="../../videos/black_frame.mp4"

if [ -f "$VIDEO_PATH" ]; then
    mpv "$VIDEO_PATH"
else
    echo "black_frame.mp4 not found in videos directory."
    # Fallback: try to play a black color using lavfi if mpv supports it, or just exit
    mpv --image-display-duration=1 color=c=black
fi
