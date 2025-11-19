#!/bin/bash
# Manual video player tool consistent with Droid server (uses mpv)
# Usage: ./run_vid.sh <path_to_video_file>

if [ -z "$1" ]; then
    echo "Usage: $0 <path_to_video_file>"
    exit 1
fi

mpv "$1"
