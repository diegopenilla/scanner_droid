const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

let currentProcess = null; // For audio or video

// Serve the static HTML frontend
app.use(express.static('public'));

// Endpoint to list audio (.wav) files in the 'voices' directory
app.get('/files', (req, res) => {
    const voicesDir = path.join(__dirname, 'voices');
    fs.readdir(voicesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading voices directory');
        }
        const wavFiles = files.filter(file => path.extname(file) === '.wav');
        res.json(wavFiles);
    });
});

// Endpoint to list video files in the 'videos' directory
app.get('/videos', (req, res) => {
    const videosDir = path.join(__dirname, 'videos');
    fs.readdir(videosDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading videos directory');
        }
        const videoFiles = files.filter(file => ['.mp4', '.avi', '.mkv', '.mov'].includes(path.extname(file)));
        res.json(videoFiles);
    });
});

// Endpoint to play audio
app.post('/play', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'voices', fileName);

    if (currentProcess) {
        return res.status(400).send('A process is already running. Please stop it first.');
    }

    currentProcess = spawn('mplayer', ['-ao', 'alsa', filePath]);

    console.log(`Playing audio: ${fileName}`);

    currentProcess.on('close', (code) => {
        currentProcess = null;
        console.log(`Audio finished with exit code ${code}`);
    });

    res.send('Playing audio');
});

// Endpoint to play video
app.post('/playVideo', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'videos', fileName);

    if (currentProcess) {
        return res.status(400).send('A process is already running. Please stop it first.');
    }

    currentProcess = spawn('mplayer', ['-ao', 'alsa', '-vo', 'fbdev2:/dev/fb0', '-vf', 'scale=720:480', filePath]);

    console.log(`Playing video: ${fileName}`);

    currentProcess.on('close', (code) => {
        currentProcess = null;
        console.log(`Video finished with exit code ${code}`);
    });

    res.send('Playing video');
});

// Endpoint to play video in loop mode (loops 100000 times)
app.post('/loopVideo', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'videos', fileName);

    if (currentProcess) {
        return res.status(400).send('A process is already running. Please stop it first.');
    }

    // Run mplayer with the loop option, looping 100 times
    currentProcess = spawn('mplayer', ['-loop', '10000', '-ao', 'alsa', '-vo', 'fbdev2:/dev/fb0', '-vf', 'scale=720:480', filePath]);

    console.log(`Looping video: ${fileName}`);

    currentProcess.on('close', (code) => {
        currentProcess = null;
        console.log(`Looped video finished with exit code ${code}`);
    });

    res.send('Looping video');
});

// Endpoint to stop audio/video
app.post('/stop', (req, res) => {
    if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
        console.log('Process stopped');
        res.send('Stopped process');
    } else {
        res.status(400).send('No process is currently running.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});