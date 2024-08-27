const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

let isPlaying = false;
let isPlayingVideo = false;
let currentProcess = null;  // For audio
let currentVideoProcess = null;  // For video

// Serve the static HTML frontend
app.use(express.static('public'));

// Endpoint to list audio (.wav) files in the 'voices' directory
app.get('/files', (req, res) => {
    const voicesDir = path.join(__dirname, 'voices');
    fs.readdir(voicesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading voices directory');
        }
        // Filter for .wav files
        const wavFiles = files.filter(file => path.extname(file) === '.wav');
        res.json(wavFiles);
    });
});

// Endpoint to play audio with mplayer (uses spawn to control process)
app.post('/play', (req, res) => {
    if (isPlaying) {
        return res.status(400).send('Audio is already playing');
    }

    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'voices', fileName);

    // Run mplayer command using spawn to control it later
    currentProcess = spawn('mplayer', ['-ao', 'alsa', filePath]);

    isPlaying = true;
    console.log(`Playing audio: ${fileName}`);

    // Listen for when the audio process finishes, to reset isPlaying
    currentProcess.on('close', (code) => {
        isPlaying = false;
        currentProcess = null;
        console.log(`Audio finished playing with exit code ${code}`);
    });

    res.send('Playing audio');
});

// Endpoint to pause/resume audio
app.post('/pause', (req, res) => {
    if (currentProcess && currentProcess.stdin) {
        // Send the "pause" command to mplayer (it toggles between pause and resume)
        currentProcess.stdin.write('p');
        res.send('Toggled pause/resume on audio');
    } else {
        res.status(400).send('No audio is playing');
    }
});

// Endpoint to stop audio
app.post('/stop', (req, res) => {
    if (currentProcess) {
        currentProcess.kill();
        isPlaying = false;
        currentProcess = null;
        console.log('Audio stopped');
        res.send('Stopped audio');
    } else {
        res.status(400).send('No audio is playing');
    }
});

// Endpoint to list video files in the 'videos' directory
app.get('/videos', (req, res) => {
    const videosDir = path.join(__dirname, 'videos');
    fs.readdir(videosDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading videos directory');
        }
        // Filter for video files
        const videoFiles = files.filter(file => ['.mp4', '.avi', '.mkv'].includes(path.extname(file)));
        res.json(videoFiles);
    });
});

// Endpoint to play video with mplayer (uses spawn to control process)
app.post('/playVideo', (req, res) => {
    if (isPlayingVideo) {
        return res.status(400).send('Video is already playing');
    }

    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'videos', fileName);

    // Run mplayer command using spawn to control it later
    currentVideoProcess = spawn('mplayer', ['-ao', 'alsa', '-vo', 'fbdev2:/dev/fb0', '-vf', 'scale=720:480', filePath]);

    isPlayingVideo = true;
    console.log(`Playing video: ${fileName}`);

    // Listen for when the video process finishes, to reset isPlayingVideo
    currentVideoProcess.on('close', (code) => {
        isPlayingVideo = false;
        currentVideoProcess = null;
        console.log(`Video finished playing with exit code ${code}`);
    });

    res.send('Playing video');
});

// Endpoint to pause/resume video
app.post('/pauseVideo', (req, res) => {
    if (currentVideoProcess && currentVideoProcess.stdin) {
        // Send the "pause" command to mplayer (it toggles between pause and resume)
        currentVideoProcess.stdin.write('p');
        res.send('Toggled pause/resume on video');
    } else {
        res.status(400).send('No video is playing');
    }
});

// Endpoint to stop video
app.post('/stopVideo', (req, res) => {
    if (currentVideoProcess) {
        currentVideoProcess.kill();
        isPlayingVideo = false;
        currentVideoProcess = null;
        console.log('Video stopped');
        res.send('Stopped video');
    } else {
        res.status(400).send('No video is playing');
    }
});

// Endpoint to check if audio or video is playing (for polling)
app.get('/status', (req, res) => {
    res.json({
        isPlaying,
        isPlayingVideo
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});