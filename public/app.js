document.addEventListener('DOMContentLoaded', () => {

    const audioSelect = document.getElementById('audioSelect');
    const playAudioButton = document.getElementById('playAudioButton');
    const pauseAudioButton = document.getElementById('pauseAudioButton');
    const stopAudioButton = document.getElementById('stopAudioButton');
    
    const videoSelect = document.getElementById('videoSelect');
    const playVideoButton = document.getElementById('playVideoButton');
    const loopVideoButton = document.getElementById('loopVideoButton');
    const pauseVideoButton = document.getElementById('pauseVideoButton');
    const stopVideoButton = document.getElementById('stopVideoButton');

    const audioUpload = document.getElementById('audioUpload');
    const uploadAudioButton = document.getElementById('uploadAudioButton');
    const audioSpinnerContainer = document.getElementById('audioSpinnerContainer');
    const audioUploadPercent = document.getElementById('audioUploadPercent');

    const videoUpload = document.getElementById('videoUpload');
    const uploadVideoButton = document.getElementById('uploadVideoButton');
    const videoSpinnerContainer = document.getElementById('videoSpinnerContainer');
    const videoUploadPercent = document.getElementById('videoUploadPercent');

    let audioIsPlaying = false;
    let videoIsPlaying = false;

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

    // Fetch available video files
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

    // Play audio
    playAudioButton.addEventListener('click', () => {
        const selectedFile = audioSelect.value;
        if (selectedFile && !audioIsPlaying) {
            fetch(`/play?file=${selectedFile}`, { method: 'POST' })
                .then(() => {
                    audioIsPlaying = true;
                    toggleAudioButtons(false);
                })
                .catch(err => console.error('Error playing audio:', err));
        }
    });

    // Play video
    playVideoButton.addEventListener('click', () => {
        const selectedFile = videoSelect.value;
        if (selectedFile && !videoIsPlaying) {
            fetch(`/playVideo?file=${selectedFile}`, { method: 'POST' })
                .then(() => {
                    videoIsPlaying = true;
                    toggleVideoButtons(false);
                })
                .catch(err => console.error('Error playing video:', err));
        }
    });

    // Play video in loop mode
    loopVideoButton.addEventListener('click', () => {
        const selectedFile = videoSelect.value;
        if (selectedFile && !videoIsPlaying) {
            fetch(`/loopVideo?file=${selectedFile}`, { method: 'POST' })
                .then(() => {
                    videoIsPlaying = true;
                    toggleVideoButtons(false);
                })
                .catch(err => console.error('Error looping video:', err));
        }
    });

    // Stop audio
    stopAudioButton.addEventListener('click', () => {
        if (audioIsPlaying) {
            fetch('/stopAudio', { method: 'POST' })
                .then(() => {
                    audioIsPlaying = false;
                    toggleAudioButtons(true);
                })
                .catch(err => console.error('Error stopping audio:', err));
        }
    });

    // Stop video
    stopVideoButton.addEventListener('click', () => {
        if (videoIsPlaying) {
            fetch('/stopVideo', { method: 'POST' })
                .then(() => {
                    videoIsPlaying = false;
                    toggleVideoButtons(true);
                })
                .catch(err => console.error('Error stopping video:', err));
        }
    });

    // Upload audio file with spinner and percentage
    uploadAudioButton.addEventListener('click', () => {
        const file = audioUpload.files[0];
        if (file && file.name.endsWith('.wav')) {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/uploadAudio', true);

            // Display spinner and percentage text
            audioSpinnerContainer.style.display = 'block';
            audioUploadPercent.innerText = '0%'; // Reset the percentage display

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    audioUploadPercent.innerText = `${percentComplete}%`; // Update percentage
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    alert('Audio uploaded successfully!');
                    audioSpinnerContainer.style.display = 'none';

                    // Refresh audio list after upload
                    fetch('/files')
                        .then(response => response.json())
                        .then(files => {
                            audioSelect.innerHTML = '<option value="">Select a file</option>';
                            files.forEach(file => {
                                const option = document.createElement('option');
                                option.value = file;
                                option.textContent = file;
                                audioSelect.appendChild(option);
                            });
                        });
                } else {
                    alert('Audio upload failed!');
                    audioSpinnerContainer.style.display = 'none';
                }
            };

            xhr.onerror = () => {
                alert('Error uploading audio.');
                audioSpinnerContainer.style.display = 'none';
            };

            xhr.send(formData);
        } else {
            alert('Please upload a valid .wav file');
        }
    });

    // Upload video file with spinner and percentage
    uploadVideoButton.addEventListener('click', () => {
        const file = videoUpload.files[0];
        if (file && (file.type === 'video/mp4' || file.type === 'video/quicktime')) {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/uploadVideo', true);

            // Display spinner and percentage text
            videoSpinnerContainer.style.display = 'block';
            videoUploadPercent.innerText = '0%'; // Reset the percentage display

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    videoUploadPercent.innerText = `${percentComplete}%`; // Update percentage
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    alert('Video uploaded successfully!');
                    videoSpinnerContainer.style.display = 'none';

                    // Refresh video list after upload
                    fetch('/videos')
                        .then(response => response.json())
                        .then(files => {
                            videoSelect.innerHTML = '<option value="">Select a video</option>';
                            files.forEach(file => {
                                const option = document.createElement('option');
                                option.value = file;
                                option.textContent = file;
                                videoSelect.appendChild(option);
                            });
                        });
                } else {
                    alert('Video upload failed!');
                    videoSpinnerContainer.style.display = 'none';
                }
            };

            xhr.onerror = () => {
                alert('Error uploading video.');
                videoSpinnerContainer.style.display = 'none';
            };

            xhr.send(formData);
        } else {
            alert('Please upload a valid .mp4 or .mov file');
        }
    });

    function toggleAudioButtons(enable) {
        playAudioButton.disabled = !enable;
        pauseAudioButton.disabled = enable;
        stopAudioButton.disabled = enable;
    }

    function toggleVideoButtons(enable) {
        playVideoButton.disabled = !enable;
        loopVideoButton.disabled = !enable;
        pauseVideoButton.disabled = enable;
        stopVideoButton.disabled = enable;
        
    }

    const printTextButton = document.getElementById('printTextButton');
    const printImageButton = document.getElementById('printImageButton');
    const textInput = document.getElementById('textInput');
    const imageUpload = document.getElementById('imageUpload');

    // Function to print text
    printTextButton.addEventListener('click', () => {
        const message = textInput.value.trim();
        if (message) {
            fetch('/printText', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            })
                .then((response) => {
                    if (response.ok) {
                        alert('Text sent to printer successfully!');
                    } else {
                        alert('Failed to send text to printer.');
                    }
                })
                .catch((err) => {
                    console.error('Error printing text:', err);
                    alert('An error occurred while sending text to the printer.');
                });
        } else {
            alert('Please enter a message to print.');
        }
    });

    // Function to print image
    printImageButton.addEventListener('click', () => {
        const file = imageUpload.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('imagePath', file);

            fetch('/printImage', {
                method: 'POST',
                body: formData,
            })
                .then((response) => {
                    if (response.ok) {
                        alert('Image sent to printer successfully!');
                    } else {
                        alert('Failed to send image to printer.');
                    }
                })
                .catch((err) => {
                    console.error('Error printing image:', err);
                    alert('An error occurred while sending the image to the printer.');
                });
        } else {
            alert('Please upload an image to print.');
        }
    });
});