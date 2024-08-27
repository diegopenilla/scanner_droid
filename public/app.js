document.addEventListener('DOMContentLoaded', () => {
    // Audio Section Elements
    const audioSelect = document.getElementById('audioSelect');
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');
    let isPlaying = false;
    let isPaused = false;

    // Video Section Elements
    const videoSelect = document.getElementById('videoSelect');
    const playVideoButton = document.getElementById('playVideoButton');
    const pauseVideoButton = document.getElementById('pauseVideoButton');
    const resumeVideoButton = document.getElementById('resumeVideoButton');
    let isPlayingVideo = false;
    let isPausedVideo = false;

    // Fetch available .wav files for audio
    fetch('/files')
        .then(response => response.json())
        .then(files => {
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file;
                audioSelect.appendChild(option);
            });
        });

    // Fetch available video files for video
    fetch('/videos')
        .then(response => response.json())
        .then(files => {
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file;
                videoSelect.appendChild(option);
            });
        });

    // Play selected audio file
    playButton.addEventListener('click', () => {
        const selectedFile = audioSelect.value;
        if (selectedFile) {
            fetch(`/play?file=${selectedFile}`, { method: 'POST' })
                .then(() => {
                    isPlaying = true;
                    isPaused = false;
                    togglePlayPauseResumeButtons('playing');
                    console.log('Playing audio');
                    checkIfAudioFinished(); // Start polling for file completion
                })
                .catch(err => console.error(err));
        }
    });

    // Play selected video file
    playVideoButton.addEventListener('click', () => {
        const selectedFile = videoSelect.value;
        if (selectedFile) {
            // If a video is already playing, stop it before playing the new one
            if (isPlayingVideo) {
                fetch(`/stopVideo`, { method: 'POST' })
                    .then(() => {
                        console.log('Stopped current video');
                        startNewVideo(selectedFile);
                    })
                    .catch(err => console.error(err));
            } else {
                startNewVideo(selectedFile); // Start the new video
            }
        }
    });

    // Function to start a new video
    function startNewVideo(file) {
        fetch(`/playVideo?file=${file}`, { method: 'POST' })
            .then(() => {
                isPlayingVideo = true;
                isPausedVideo = false;
                togglePlayPauseResumeButtons('playingVideo');
                console.log('Playing video');
                checkIfVideoFinished(); // Start polling for video completion
            })
            .catch(err => console.error(err));
    }

    // Pause the audio
    pauseButton.addEventListener('click', () => {
        if (isPlaying) {
            fetch(`/pause?action=pause`, { method: 'POST' })
                .then(() => {
                    isPlaying = false;
                    isPaused = true; // Now paused
                    togglePlayPauseResumeButtons('paused');
                    console.log('Paused audio');
                })
                .catch(err => console.error(err));
        }
    });

    // Pause the video
    pauseVideoButton.addEventListener('click', () => {
        if (isPlayingVideo) {
            fetch(`/pauseVideo?action=pause`, { method: 'POST' })
                .then(() => {
                    isPlayingVideo = false;
                    isPausedVideo = true; // Now paused
                    togglePlayPauseResumeButtons('pausedVideo');
                    console.log('Paused video');
                })
                .catch(err => console.error(err));
        }
    });

    // Resume the audio
    resumeButton.addEventListener('click', () => {
        if (isPaused) {
            fetch(`/pause?action=resume`, { method: 'POST' })
                .then(() => {
                    isPlaying = true;
                    isPaused = false; // Now resumed
                    togglePlayPauseResumeButtons('resumed');
                    console.log('Resumed audio');
                })
                .catch(err => console.error(err));
        }
    });

    // Resume the video
    resumeVideoButton.addEventListener('click', () => {
        if (isPausedVideo) {
            fetch(`/pauseVideo?action=resume`, { method: 'POST' })
                .then(() => {
                    isPlayingVideo = true;
                    isPausedVideo = false; // Now resumed
                    togglePlayPauseResumeButtons('resumedVideo');
                    console.log('Resumed video');
                })
                .catch(err => console.error(err));
        }
    });

    // Function to toggle Play/Pause/Resume buttons for both audio and video
    function togglePlayPauseResumeButtons(state) {
        if (state === 'playing') {
            playButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            resumeButton.style.display = 'none';
        } else if (state === 'paused') {
            pauseButton.style.display = 'none';
            resumeButton.style.display = 'inline-block';
        } else if (state === 'resumed') {
            pauseButton.style.display = 'inline-block';
            resumeButton.style.display = 'none';
        } else if (state === 'playingVideo') {
            playVideoButton.style.display = 'none';
            pauseVideoButton.style.display = 'inline-block';
            resumeVideoButton.style.display = 'none';
        } else if (state === 'pausedVideo') {
            pauseVideoButton.style.display = 'none';
            resumeVideoButton.style.display = 'inline-block';
        } else if (state === 'resumedVideo') {
            pauseVideoButton.style.display = 'inline-block';
            resumeVideoButton.style.display = 'none';
        } else {
            // Reset to initial state for both audio and video
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
            resumeButton.style.display = 'none';

            playVideoButton.style.display = 'inline-block';
            pauseVideoButton.style.display = 'none';
            resumeVideoButton.style.display = 'none';
        }
    }

    // Polling the server to check if the audio has finished playing
    function checkIfAudioFinished() {
        const interval = setInterval(() => {
            fetch('/status')
                .then(response => response.json())
                .then(status => {
                    // Only stop polling and reset buttons when audio finishes
                    if (!status.isPlaying && !isPaused) {
                        clearInterval(interval); // Stop polling
                        onAudioComplete(); // Handle audio completion
                    }
                })
                .catch(err => {
                    clearInterval(interval);
                    console.error('Error checking audio status:', err);
                });
        }, 1000); // Poll every 1 second
    }

    // Polling the server to check if the video has finished playing
    function checkIfVideoFinished() {
        const interval = setInterval(() => {
            fetch('/status')
                .then(response => response.json())
                .then(status => {
                    // Only stop polling and reset buttons when video finishes
                    if (!status.isPlayingVideo && !isPausedVideo) {
                        clearInterval(interval); // Stop polling
                        onVideoComplete(); // Handle video completion
                    }
                })
                .catch(err => {
                    clearInterval(interval);
                    console.error('Error checking video status:', err);
                });
        }, 1000); // Poll every 1 second
    }

    // Handle when the audio finishes playing
    function onAudioComplete() {
        isPlaying = false;
        isPaused = false;
        togglePlayPauseResumeButtons('stopped'); // Reset buttons to the initial state
        console.log('Audio finished playing');
    }

    // Handle when the video finishes playing
    function onVideoComplete() {
        isPlayingVideo = false;
        isPausedVideo = false;
        togglePlayPauseResumeButtons('stoppedVideo'); // Reset buttons to the initial state
        console.log('Video finished playing');
    }
});