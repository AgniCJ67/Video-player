// Video Elements
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
const fullscreenBtn = document.getElementById('fullscreenBtn');

// UI and Info Panels
const videoTitleDisplay = document.getElementById('videoTitleDisplay');
const videoInfoPanel = document.getElementById('videoInfoPanel');
const playlistTitle = document.getElementById('playlistTitle');
const currentPlaylistItem = document.getElementById('currentPlaylistItem');

// Popups
const speedBtn = document.getElementById('speedBtn');
const speedOptions = document.getElementById('speedOptions');

// App Shell Elements
const appImportBtn = document.getElementById('appImportBtn');
const appVideoUpload = document.getElementById('appVideoUpload');
const appSettingsBtn = document.getElementById('appSettingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const themeSelect = document.getElementById('themeSelect');

// Filters & Settings
const brightSlider = document.getElementById('brightSlider');
const contrastSlider = document.getElementById('contrastSlider');
const satSlider = document.getElementById('satSlider');
const fpsSlider = document.getElementById('fpsSlider');
const brightVal = document.getElementById('brightVal');
const contrastVal = document.getElementById('contrastVal');
const satVal = document.getElementById('satVal');
const fpsVal = document.getElementById('fpsVal');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');

// --- Sync UI with Native Video State ---
video.addEventListener('play', () => {
    videoContainer.classList.remove('paused');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
});

video.addEventListener('pause', () => {
    videoContainer.classList.add('paused');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});

function togglePlay() {
    // Only toggle if media is actually loaded
    if (!video.src || videoContainer.classList.contains('no-media')) return;
    
    if (video.paused) {
        video.play().catch(e => console.error("Playback failed:", e));
    } else {
        video.pause();
    }
}
playPauseBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);
// --- Time and Progress ---
const progressSlider = document.getElementById('progressSlider');
let isScrubbing = false; // Tracks if the user is currently dragging

function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

video.addEventListener('loadedmetadata', () => { 
    durationEl.textContent = formatTime(video.duration); 
});

video.addEventListener('timeupdate', () => {
    // Only update the progress bar visually if the user IS NOT currently dragging it
    if (!isScrubbing) {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
        progressSlider.value = percent; // Sync the invisible slider
        currentTimeEl.textContent = formatTime(video.currentTime);
    }
});

// Triggers continuously while the user drags the slider
progressSlider.addEventListener('input', (e) => {
    if (videoContainer.classList.contains('no-media')) return;
    isScrubbing = true;
    const percent = e.target.value;
    
    // Visually update the bar and time immediately for smooth feedback
    progressBar.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime((percent / 100) * video.duration);
});

// Triggers once when the user releases the slider
progressSlider.addEventListener('change', (e) => {
    if (videoContainer.classList.contains('no-media')) return;
    const percent = e.target.value;
    
    // Actually jump the video to the new time
    video.currentTime = (percent / 100) * video.duration;
    isScrubbing = false;
});

// (Remove the old progressContainer.addEventListener('click', ...) block entirely)


// --- Audio Controls ---
volumeSlider.addEventListener('input', (e) => {
    video.volume = e.target.value;
    video.muted = e.target.value === "0";
    volumeIcon.style.display = video.muted ? 'none' : 'block';
    muteIcon.style.display = video.muted ? 'block' : 'none';
});
muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    volumeSlider.value = video.muted ? 0 : video.volume;
    volumeIcon.style.display = video.muted ? 'none' : 'block';
    muteIcon.style.display = video.muted ? 'block' : 'none';
});

// --- In-Player Popups (Speed) ---
function closePopups() {
    speedOptions.classList.remove('active');
}
speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = speedOptions.classList.contains('active');
    closePopups();
    if (!isActive) speedOptions.classList.add('active');
});
document.querySelectorAll('#speedOptions .popup-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.stopPropagation();
        video.playbackRate = opt.dataset.speed;
        speedBtn.textContent = `${opt.dataset.speed}x`;
        document.querySelector('#speedOptions .active').classList.remove('active');
        opt.classList.add('active');
        fpsSlider.value = opt.dataset.speed * 30;
        fpsVal.textContent = fpsSlider.value;
        closePopups();
    });
});
document.addEventListener('click', closePopups);

fullscreenBtn.addEventListener('click', () => {
    if (videoContainer.classList.contains('no-media')) return;
    if (!document.fullscreenElement) videoContainer.requestFullscreen();
    else document.exitFullscreen();
});

// --- App Sidebar & File Import ---
appImportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    appVideoUpload.click();
});

appVideoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        video.src = fileURL;
        video.load(); 
        
        // Remove empty state and enable UI
        videoContainer.classList.remove('no-media');
        videoInfoPanel.style.opacity = '1';
        videoInfoPanel.style.pointerEvents = 'auto';
        
        // Update Video Title to File Name
        let fileName = file.name.replace(/\.[^/.]+$/, "");
        videoTitleDisplay.textContent = fileName;
        playlistTitle.textContent = fileName;
        
        // Add visual flair to the active playlist item
        const activeThumb = currentPlaylistItem.querySelector('.thumb');
        activeThumb.style.background = 'var(--accent)';
        
        progressBar.style.width = `0%`;
        
        video.play().catch(err => console.error("Autoplay blocked:", err));
        e.target.value = ''; 
    }
});

// --- App Settings Modal ---
appSettingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
settingsModal.addEventListener('click', (e) => {
    if(e.target === settingsModal) settingsModal.classList.remove('active');
});

themeSelect.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
});

// Video Visual Filters
function applyFilters() {
    brightVal.textContent = brightSlider.value;
    contrastVal.textContent = contrastSlider.value;
    satVal.textContent = satSlider.value;
    video.style.filter = `brightness(${brightSlider.value}%) contrast(${contrastSlider.value}%) saturate(${satSlider.value}%)`;
}
brightSlider.addEventListener('input', applyFilters);
contrastSlider.addEventListener('input', applyFilters);
satSlider.addEventListener('input', applyFilters);

// Simulated FPS
fpsSlider.addEventListener('input', (e) => {
    fpsVal.textContent = e.target.value;
    const rate = (e.target.value / 30).toFixed(2);
    video.playbackRate = rate;
    speedBtn.textContent = `${rate}x`;
    document.querySelector('#speedOptions .active')?.classList.remove('active');
});

// Reset Settings
resetSettingsBtn.addEventListener('click', () => {
    brightSlider.value = 100;
    contrastSlider.value = 100;
    satSlider.value = 100;
    fpsSlider.value = 30;
    themeSelect.value = "dark";
    document.documentElement.setAttribute('data-theme', 'dark');
    applyFilters();
    fpsSlider.dispatchEvent(new Event('input'));
});
