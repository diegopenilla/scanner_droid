#!/bin/bash
# Manual audio player tool consistent with Droid server
# Usage: ./audio.sh <path_to_wav_file>

if [ -z "$1" ]; then
    echo "Usage: $0 <path_to_wav_file>"
    exit 1
fi

mplayer "$1"
