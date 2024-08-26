document.addEventListener('DOMContentLoaded', () => {
    const audioSelect = document.getElementById('audioSelect');
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');
    let isPlaying = false;
    let isPaused = false;

    // Fetch available .wav files
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

    // Function to toggle Play/Pause/Resume buttons
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
        } else {
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
            resumeButton.style.display = 'none';
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

    // Handle when the audio finishes playing
    function onAudioComplete() {
        isPlaying = false;
        isPaused = false;
        togglePlayPauseResumeButtons('stopped'); // Reset buttons to the initial state
        console.log('Audio finished playing');
    }
});