// DOM Elements
const video = document.getElementById('video');
const videoContainer = document.getElementById('videoContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const muteBtn = document.getElementById('muteBtn');
const volumeIcon = document.querySelector('.volume-icon');
const muteIcon = document.querySelector('.mute-icon');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const speedBtn = document.getElementById('speedBtn');
const speedOptions = document.getElementById('speedOptions');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const videoUpload = document.getElementById('videoUpload');
const uploadBtn = document.getElementById('uploadBtn');

// 1. Play / Pause Logic
function togglePlay() {
    if (video.paused) {
        video.play().catch(e => console.log("Playback failed:", e));
        videoContainer.classList.remove('paused');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        video.pause();
        videoContainer.classList.add('paused');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

playPauseBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

// 2. Formatting Time
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// 3. Update Progress Scroll Bar & Time
video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
});

video.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(video.currentTime);
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
});

// 4. Seek/Scroll Functionality
progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = video.duration;
    video.currentTime = (clickX / width) * duration;
});

// 5. Volume / Audio Control
function updateVolumeIcon(vol) {
    if (vol == 0 || video.muted) {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'block';
    } else {
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
    }
}

volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    video.volume = val;
    video.muted = val === "0";
    updateVolumeIcon(video.volume);
});

muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    volumeSlider.value = video.muted ? 0 : video.volume;
    updateVolumeIcon(video.volume);
});

// 6. Playback Speed Adjustment
speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    speedOptions.classList.toggle('active');
});

document.querySelectorAll('.speed-option').forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const speed = option.getAttribute('data-speed');
        video.playbackRate = speed;
        speedBtn.textContent = `${speed}x`;
        
        document.querySelector('.speed-option.active').classList.remove('active');
        option.classList.add('active');
        speedOptions.classList.remove('active');
    });
});

document.addEventListener('click', () => {
    speedOptions.classList.remove('active');
});

// 7. Fullscreen Control
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        if(videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if(videoContainer.webkitRequestFullscreen) { /* Safari */
            videoContainer.webkitRequestFullscreen();
        }
    } else {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        }
    }
});

// 8. FILE UPLOAD LOGIC
uploadBtn.addEventListener('click', () => {
    videoUpload.click();
});

videoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file) {
        const fileURL = URL.createObjectURL(file);
        
        // Remove poster once local video is loaded
        video.removeAttribute("poster");
        video.src = fileURL;
        
        progressBar.style.width = `0%`;
        currentTimeEl.textContent = "0:00";
        
        video.play();
        videoContainer.classList.remove('paused');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }
});
