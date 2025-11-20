// NOTE: Internet Connectivity & API Calls
// This server operates in two network modes:
// 1. Client Mode (Connected to Phone/Home Wi-Fi): Internet IS available. External API calls (OpenAI, Weather, etc.) will work.
// 2. Access Point Mode (Offline, "SD1X" network): Internet is NOT available. External API calls will fail.
// 
// RECOMMENDATION: Before implementing any external API calls, add a check for internet connectivity 
// (e.g., dns.lookup('google.com') or ping) to prevent timeouts or errors when in AP Mode.

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle URL-encoded data if needed


// Helper function to log messages to a file
function logToFile(message) {
    console.log(message)
}

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


// PRINTER
// Additional functionality: Printing via USB Printer
// Endpoint to print text to the USB printer
// Endpoint to print text to the USB printer
app.post('/printText', (req, res) => {
    const { message } = req.body;

    if (!message) {
        logToFile('Failed to print text: No text message provided.');
        return res.status(400).send('No text message provided for printing.');
    }

    const pythonProcess = spawn('/home/pi/Droid/venv/bin/python3', ['/home/pi/Droid/print_image.py', 'text', message]);

    pythonProcess.stdout.on('data', (data) => {
        logToFile(`stdout (printText): ${data}`);
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        logToFile(`stderr (printText): ${data}`);
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            logToFile('Text printed successfully.');
            res.send('Text printed successfully.');
        } else {
            logToFile('Failed to print text. Exit code: ' + code);
            res.status(500).send('Failed to print text. Check server logs for details.');
        }
    });
});

// Endpoint to print an image to the USB printer
app.post('/printImage', (req, res) => {
    const { imagePath } = req.body;

    if (!imagePath) {
        logToFile('Failed to print image: No image path provided.');
        return res.status(400).send('No image path provided for printing.');
    }

    const pythonProcess = spawn('/home/pi/Droid/venv/bin/python3', ['/home/pi/Droid/print_image.py', 'image', imagePath]);

    pythonProcess.stdout.on('data', (data) => {
        logToFile(`stdout (printImage): ${data}`);
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        logToFile(`stderr (printImage): ${data}`);
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            logToFile('Image printed successfully.');
            res.send('Image printed successfully.');
        } else {
            logToFile('Failed to print image. Exit code: ' + code);
            res.status(500).send('Failed to print image. Check server logs for details.');
        }
    });
});

// ________ END PRINTER_____


// ________ ELEVENLABS TTS ________

// Endpoint to list available ElevenLabs voices
app.get('/tts/voices', (req, res) => {
    // Ensure we use the same python env as the rest of the system
    // Assuming the same venv structure or system python for now
    const pythonCmd = 'python3'; 
    const scriptPath = path.join(__dirname, 'droid_tts.py');

    const pythonProcess = spawn(pythonCmd, [scriptPath, 'list']);
    
    let dataBuffer = '';

    pythonProcess.stdout.on('data', (data) => {
        dataBuffer += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`TTS stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const voices = JSON.parse(dataBuffer);
                res.json(voices);
            } catch (e) {
                console.error('Failed to parse voices JSON:', dataBuffer);
                res.status(500).send('Failed to parse voices JSON');
            }
        } else {
            res.status(500).send('Failed to list voices');
        }
    });
});

// Endpoint to generate speech from text
app.post('/tts/generate', (req, res) => {
    const { text, voiceId } = req.body;
    const outputName = `tts_${Date.now()}`; // Generate unique filename

    if (!text || !voiceId) {
        return res.status(400).send('Text and Voice ID are required');
    }

    const pythonCmd = 'python3';
    const scriptPath = path.join(__dirname, 'droid_tts.py');

    console.log(`Generating TTS: "${text}" with voice ${voiceId}`);

    const pythonProcess = spawn(pythonCmd, [scriptPath, 'generate', text, voiceId, outputName]);

    let dataBuffer = '';

    pythonProcess.stdout.on('data', (data) => {
        dataBuffer += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`TTS Gen stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        try {
            // Attempt to find the JSON in the output (in case of extra prints)
            const jsonStart = dataBuffer.indexOf('{');
            const jsonEnd = dataBuffer.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = dataBuffer.substring(jsonStart, jsonEnd + 1);
                const result = JSON.parse(jsonStr);
                if (result.success) {
                    res.json(result);
                } else {
                    res.status(500).json(result);
                }
            } else {
                 throw new Error("No JSON found");
            }
        } catch (e) {
            console.error("Parse error:", dataBuffer);
            res.status(500).send('Failed to generate speech');
        }
    });
});

// ________ END ELEVENLABS TTS ________


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
