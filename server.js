const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

let audioProcess = null;
let videoProcess = null;

// Set up Multer storage for audio uploads
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'voices'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Set up Multer storage for video uploads
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'videos'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Initialize upload middleware with file extension filters
const audioUpload = multer({
    storage: audioStorage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.wav') {
            cb(null, true);
        } else {
            cb(new Error('Only .wav files are allowed!'));
        }
    }
});


const videoUpload = multer({
    storage: videoStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'video/mp4' || file.mimetype === 'video/quicktime') {
            cb(null, true);
        } else {
            cb(new Error('Only .mp4 or .mov files are allowed!'));
        }
    }
});

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
        const videoFiles = files.filter(file => ['.mp4', '.mov'].includes(path.extname(file)));
        res.json(videoFiles);
    });
});

// Endpoint to play audio (using mplayer)
app.post('/play', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'voices', fileName);

    if (audioProcess) {
        return res.status(400).send('An audio process is already running. Please stop it first.');
    }

    audioProcess = spawn('mplayer', [filePath]);

    console.log(`Playing audio: ${fileName}`);

    audioProcess.on('close', (code) => {
        audioProcess = null;
        console.log(`Audio finished with exit code ${code}`);
    });

    res.send('Playing audio');
});

// Endpoint to stop audio process
app.post('/stopAudio', (req, res) => {
    if (audioProcess) {
        audioProcess.kill();
        audioProcess = null;
        console.log('Audio process stopped.');
        res.send('Stopped audio process');
    } else {
        res.status(400).send('No audio process is running.');
    }
});

// Endpoint to play video using mpv
app.post('/playVideo', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.resolve(__dirname, 'videos', fileName);

    if (videoProcess) {
        return res.status(400).send('A video process is already running. Please stop it first.');
    }

    videoProcess = spawn('mpv', [filePath]);

    console.log(`Playing video: ${fileName}`);

    videoProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    videoProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    videoProcess.on('close', (code) => {
        videoProcess = null;
        console.log(`Video finished with exit code ${code}`);
    });

    res.send('Playing video');
});

// Endpoint to loop video using mpv
app.post('/loopVideo', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.resolve(__dirname, 'videos', fileName);

    if (videoProcess) {
        return res.status(400).send('A video process is already running. Please stop it first.');
    }

    videoProcess = spawn('mpv', ['--loop=inf', filePath]);

    console.log(`Looping video: ${fileName}`);

    videoProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    videoProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    videoProcess.on('close', (code) => {
        videoProcess = null;
        console.log(`Looped video finished with exit code ${code}`);
    });

    res.send('Looping video');
});

// Endpoint to stop video process
app.post('/stopVideo', (req, res) => {
    if (videoProcess) {
        videoProcess.kill();
        videoProcess = null;
        console.log('Video process stopped.');
        res.send('Stopped video process');
    } else {
        res.status(400).send('No video process is running.');
    }
});

// Endpoint to handle audio file upload
app.post('/uploadAudio', audioUpload.single('file'), (req, res) => {
    res.send('Audio file uploaded successfully');
});

// Endpoint to handle video file upload
app.post('/uploadVideo', videoUpload.single('file'), (req, res) => {
    res.send('Video file uploaded successfully');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});