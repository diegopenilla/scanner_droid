const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const app = express();
const PORT = 3000;

// Global variable to track whether audio is currently playing
let isPlaying = false;
let currentProcess = null;  // To keep track of the mplayer process

// Serve the static HTML frontend (index.html and other assets) from the public directory
app.use(express.static('public'));

// Endpoint to list .wav files in the 'voices' directory
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

// Endpoint to play audio with mplayer
app.post('/play', (req, res) => {
    if (isPlaying) {
        return res.status(400).send('Audio is already playing');
    }

    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'voices', fileName);

    // Run mplayer command to play the audio without the -loop option
    const playCommand = `mplayer -vo fbdev2:/dev/fb0 -ao alsa -vf scale=720:480 ${filePath}`;
    
    currentProcess = exec(playCommand, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Error executing mplayer: ${error.message}`);
        }
    });

    isPlaying = true;
    console.log(`Playing: ${fileName}`);

    // Listen for when the process finishes, to reset isPlaying
    currentProcess.on('close', (code) => {
        isPlaying = false;
        console.log(`Audio finished playing with exit code ${code}`);
    });

    res.send('Playing audio');
});

// Endpoint to pause/resume audio
app.post('/pause', (req, res) => {
    const action = req.query.action; // Either 'pause' or 'resume'
    const command = action === 'pause' ? 'pkill -STOP mplayer' : 'pkill -CONT mplayer';
    
    exec(command, (error) => {
        if (error) {
            return res.status(500).send(`Error pausing/resuming mplayer: ${error.message}`);
        }

        // Update playing state based on the action
        if (action === 'pause') {
            isPlaying = false;
            console.log('Audio paused');
        } else if (action === 'resume') {
            isPlaying = true;
            console.log('Audio resumed');
        }

        res.send(`${action === 'pause' ? 'Paused' : 'Resumed'} audio`);
    });
});

// Endpoint to stop audio
app.post('/stop', (req, res) => {
    if (currentProcess) {
        exec('pkill mplayer', (error) => {
            if (error) {
                return res.status(500).send(`Error stopping mplayer: ${error.message}`);
            }

            isPlaying = false;  // Reset the state when audio stops
            currentProcess = null;
            console.log('Audio stopped');
            res.send('Stopped audio');
        });
    } else {
        res.status(400).send('No audio is playing');
    }
});

// Endpoint to check if audio is playing (for polling)
app.get('/status', (req, res) => {
    res.json({ isPlaying });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});