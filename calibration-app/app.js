// VisionCare - Eye Tracking Calibration and Exercise System

const AI_SERVICE_URL = 'http://localhost:5001';
const CALIBRATION_POINTS = 9; // 3x3 grid
const SAMPLES_PER_POINT = 5; // Number of samples to collect per point
const SAMPLE_INTERVAL = 200; // ms between samples

// State
let state = {
    aiConnected: false,
    cameraReady: false,
    calibrationData: null,
    currentScreen: 'menu',
    isTracking: false,
    lastPupilPosition: null,
    blinkCount: 0,
    exerciseStartTime: null,
    pupilTrail: []
};

// Camera stream
let cameraStream = null;
let cameraVideo = null;
let captureCanvas = null;
let captureContext = null;

// Calibration state
let calibrationState = {
    points: [],
    currentPointIndex: -1,
    samplesCollected: 0,
    allSamples: []
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    cameraVideo = document.getElementById('cameraVideo');

    // Create hidden canvas for capture
    captureCanvas = document.createElement('canvas');
    captureContext = captureCanvas.getContext('2d');

    // Check AI service
    await checkAIService();

    // Start camera
    await startCamera();

    // Load saved calibration if exists
    loadCalibration();

    // Start connection monitoring
    setInterval(checkAIService, 5000);
});

// AI Service Functions
async function checkAIService() {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/health`);
        const data = await response.json();

        state.aiConnected = data.status === 'healthy';
        updateConnectionStatus(true);
        updateAIStatus(true);
    } catch (error) {
        state.aiConnected = false;
        updateConnectionStatus(false);
        updateAIStatus(false);
    }
}

async function detectFace(imageBase64) {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/api/detect-face`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageBase64,
                timestamp: new Date().toISOString()
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Face detection error:', error);
        return null;
    }
}

// Camera Functions
async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        cameraVideo.srcObject = cameraStream;
        await cameraVideo.play();

        // Set canvas size to match video
        captureCanvas.width = cameraVideo.videoWidth;
        captureCanvas.height = cameraVideo.videoHeight;

        state.cameraReady = true;
        updateCameraStatus(true);
        document.getElementById('cameraPlaceholder').style.display = 'none';

    } catch (error) {
        console.error('Camera error:', error);
        state.cameraReady = false;
        updateCameraStatus(false);
        document.getElementById('cameraPlaceholder').textContent = 'Kamera erişimi reddedildi';
    }
}

async function captureImage() {
    if (!state.cameraReady) return null;

    // Draw current video frame to canvas
    captureContext.drawImage(cameraVideo, 0, 0, captureCanvas.width, captureCanvas.height);

    // Convert to base64
    const imageData = captureCanvas.toDataURL('image/jpeg', 0.7);
    return imageData;
}

// UI Update Functions
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    statusEl.textContent = `AI Service: ${connected ? 'Connected' : 'Disconnected'}`;
    statusEl.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
}

function updateAIStatus(connected) {
    const statusEl = document.getElementById('aiStatus');
    statusEl.className = `status-item ${connected ? 'success' : 'error'}`;
    statusEl.querySelector('.value').textContent = connected ? '✅' : '❌';
}

function updateCameraStatus(ready) {
    const statusEl = document.getElementById('cameraStatus');
    statusEl.className = `status-item ${ready ? 'success' : 'error'}`;
    statusEl.querySelector('.value').textContent = ready ? '✅' : '❌';
}

function updateCalibrationStatus(calibrated) {
    const statusEl = document.getElementById('calibrationStatus');
    statusEl.className = `status-item ${calibrated ? 'success' : ''}`;
    statusEl.querySelector('.value').textContent = calibrated ? '✅ Aktif' : 'Yok';

    // Enable/disable buttons based on calibration
    document.getElementById('exerciseBtn').disabled = !calibrated;
    document.getElementById('trackingBtn').disabled = !calibrated;
}

function showScreen(screenId) {
    // Hide all screens
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('calibrationScreen').classList.add('hidden');
    document.getElementById('exerciseScreen').classList.add('hidden');
    document.getElementById('trackingScreen').classList.add('hidden');

    // Show requested screen
    document.getElementById(screenId).classList.remove('hidden');
    state.currentScreen = screenId;
}

// Calibration Functions
function startCalibration() {
    if (!state.aiConnected || !state.cameraReady) {
        alert('AI Service ve kamera hazır olmalı!');
        return;
    }

    showScreen('calibrationScreen');
    initializeCalibration();
}

function initializeCalibration() {
    const container = document.getElementById('calibrationContainer');
    container.innerHTML = '';

    calibrationState.points = [];
    calibrationState.currentPointIndex = -1;
    calibrationState.samplesCollected = 0;
    calibrationState.allSamples = [];

    // Create 9 calibration points (3x3 grid)
    const positions = [
        { x: 15, y: 15 },   // Top-left
        { x: 50, y: 15 },   // Top-center
        { x: 85, y: 15 },   // Top-right
        { x: 15, y: 50 },   // Middle-left
        { x: 50, y: 50 },   // Center
        { x: 85, y: 50 },   // Middle-right
        { x: 15, y: 85 },   // Bottom-left
        { x: 50, y: 85 },   // Bottom-center
        { x: 85, y: 85 }    // Bottom-right
    ];

    positions.forEach((pos, index) => {
        const point = document.createElement('div');
        point.className = 'calibration-point';
        point.style.left = `${pos.x}%`;
        point.style.top = `${pos.y}%`;
        point.dataset.index = index;
        point.dataset.x = pos.x;
        point.dataset.y = pos.y;

        container.appendChild(point);

        calibrationState.points.push({
            screenX: pos.x,
            screenY: pos.y,
            samples: []
        });
    });

    // Start with first point
    nextCalibrationPoint();
}

function nextCalibrationPoint() {
    calibrationState.currentPointIndex++;

    if (calibrationState.currentPointIndex >= CALIBRATION_POINTS) {
        // Calibration complete
        completeCalibration();
        return;
    }

    // Reset samples for new point
    calibrationState.samplesCollected = 0;

    // Update UI
    const points = document.querySelectorAll('.calibration-point');
    points.forEach((point, index) => {
        point.classList.remove('active', 'collecting');
        if (index < calibrationState.currentPointIndex) {
            point.classList.add('completed');
        }
    });

    const currentPoint = points[calibrationState.currentPointIndex];
    currentPoint.classList.add('active');

    // Wait 1 second before collecting samples
    setTimeout(() => {
        collectSamplesForPoint();
    }, 1000);

    // Update progress
    updateCalibrationProgress();
}

async function collectSamplesForPoint() {
    const currentPoint = document.querySelectorAll('.calibration-point')[calibrationState.currentPointIndex];
    currentPoint.classList.add('collecting');

    const collectSample = async () => {
        if (calibrationState.samplesCollected >= SAMPLES_PER_POINT) {
            currentPoint.classList.remove('collecting');
            nextCalibrationPoint();
            return;
        }

        // Capture and analyze
        const imageData = await captureImage();
        if (imageData) {
            const result = await detectFace(imageData);

            if (result && result.success && result.face_detected) {
                const analysis = result.analysis;

                // Check if both eyes are open
                if (analysis.eyes.both_open) {
                    // Calculate average pupil position
                    const leftPupil = analysis.eyes.left.pupil;
                    const rightPupil = analysis.eyes.right.pupil;

                    const avgPupilX = (leftPupil.x + rightPupil.x) / 2;
                    const avgPupilY = (leftPupil.y + rightPupil.y) / 2;

                    calibrationState.points[calibrationState.currentPointIndex].samples.push({
                        pupilX: avgPupilX,
                        pupilY: avgPupilY,
                        leftPupil: leftPupil,
                        rightPupil: rightPupil,
                        timestamp: Date.now()
                    });

                    calibrationState.samplesCollected++;
                    updateCalibrationProgress();
                }
            }
        }

        // Schedule next sample
        setTimeout(collectSample, SAMPLE_INTERVAL);
    };

    collectSample();
}

function updateCalibrationProgress() {
    const totalSamples = CALIBRATION_POINTS * SAMPLES_PER_POINT;
    const collectedSamples = calibrationState.points.reduce((sum, point) => sum + point.samples.length, 0);
    const percentage = Math.round((collectedSamples / totalSamples) * 100);

    const progressEl = document.getElementById('calibrationProgress');
    progressEl.style.width = `${percentage}%`;
    progressEl.textContent = `${percentage}%`;
}

function completeCalibration() {
    // Calculate mapping coefficients
    calculateCalibrationMapping();

    // Enable save button
    document.getElementById('saveCalibrationBtn').disabled = false;

    alert('Kalibrasyon tamamlandı! Kaydetmek için "Kalibrasyonu Kaydet" butonuna tıklayın.');
}

function calculateCalibrationMapping() {
    // For each calibration point, calculate average pupil position
    const mappingData = calibrationState.points.map(point => {
        if (point.samples.length === 0) return null;

        const avgPupilX = point.samples.reduce((sum, s) => sum + s.pupilX, 0) / point.samples.length;
        const avgPupilY = point.samples.reduce((sum, s) => sum + s.pupilY, 0) / point.samples.length;

        return {
            screenX: point.screenX,
            screenY: point.screenY,
            pupilX: avgPupilX,
            pupilY: avgPupilY
        };
    }).filter(p => p !== null);

    state.calibrationData = {
        points: mappingData,
        timestamp: Date.now(),
        version: '1.0'
    };
}

function saveCalibration() {
    if (!state.calibrationData) {
        alert('Kalibrasyon verisi yok!');
        return;
    }

    // Save to localStorage
    localStorage.setItem('visioncare_calibration', JSON.stringify(state.calibrationData));

    updateCalibrationStatus(true);
    alert('Kalibrasyon kaydedildi!');
    showScreen('mainMenu');
}

function loadCalibration() {
    const saved = localStorage.getItem('visioncare_calibration');
    if (saved) {
        try {
            state.calibrationData = JSON.parse(saved);
            updateCalibrationStatus(true);
        } catch (error) {
            console.error('Calibration load error:', error);
        }
    }
}

function cancelCalibration() {
    showScreen('mainMenu');
}

// Mapping function: pupil coordinates -> screen coordinates
function mapPupilToScreen(pupilX, pupilY) {
    if (!state.calibrationData || !state.calibrationData.points.length) {
        return null;
    }

    // Simple inverse distance weighted interpolation
    const points = state.calibrationData.points;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (const point of points) {
        const dx = pupilX - point.pupilX;
        const dy = pupilY - point.pupilY;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.0001; // Avoid division by zero

        const weight = 1 / (distance * distance);

        totalWeight += weight;
        weightedX += weight * point.screenX;
        weightedY += weight * point.screenY;
    }

    return {
        x: weightedX / totalWeight,
        y: weightedY / totalWeight
    };
}

// Exercise Functions
function startExercise() {
    if (!state.calibrationData) {
        alert('Önce kalibrasyon yapmalısınız!');
        return;
    }

    showScreen('exerciseScreen');
    initializeExercise();
}

function initializeExercise() {
    state.exerciseStartTime = Date.now();
    state.blinkCount = 0;
    state.isTracking = true;

    const container = document.getElementById('exerciseContainer');
    container.innerHTML = '';

    // Create moving target for eye exercise
    const target = document.createElement('div');
    target.className = 'calibration-point active';
    target.id = 'exerciseTarget';
    container.appendChild(target);

    // Start exercise sequence
    runExerciseSequence();

    // Start tracking loop
    exerciseTrackingLoop();
}

let exerciseSequence = 0;
const exerciseInstructions = [
    { text: 'Merkeze bakın', x: 50, y: 50, duration: 3000 },
    { text: 'Sola bakın', x: 15, y: 50, duration: 3000 },
    { text: 'Sağa bakın', x: 85, y: 50, duration: 3000 },
    { text: 'Yukarı bakın', x: 50, y: 15, duration: 3000 },
    { text: 'Aşağı bakın', x: 50, y: 85, duration: 3000 },
    { text: '10 kez göz kırpın', x: 50, y: 50, duration: 5000 },
    { text: 'Dairesel hareket - saat yönünde', x: 50, y: 50, duration: 8000 }
];

function runExerciseSequence() {
    if (!state.isTracking || exerciseSequence >= exerciseInstructions.length) {
        exerciseSequence = 0;
        setTimeout(runExerciseSequence, 1000);
        return;
    }

    const instruction = exerciseInstructions[exerciseSequence];
    document.getElementById('exerciseInstruction').textContent = instruction.text;

    const target = document.getElementById('exerciseTarget');
    if (target) {
        target.style.left = `${instruction.x}%`;
        target.style.top = `${instruction.y}%`;
    }

    exerciseSequence++;
    setTimeout(runExerciseSequence, instruction.duration);
}

let lastBlinkState = false;

async function exerciseTrackingLoop() {
    if (!state.isTracking) return;

    const imageData = await captureImage();
    if (imageData) {
        const result = await detectFace(imageData);

        if (result && result.success && result.face_detected) {
            const analysis = result.analysis;

            // Update display
            updateExerciseDisplay(analysis);

            // Detect blink
            if (lastBlinkState && !analysis.eyes.both_open) {
                // Blink detected
                state.blinkCount++;
                document.getElementById('blinkCount').textContent = state.blinkCount;
            }
            lastBlinkState = analysis.eyes.both_open;

            // Store last pupil position (even when blinking)
            if (analysis.eyes.both_open) {
                state.lastPupilPosition = {
                    x: (analysis.eyes.left.pupil.x + analysis.eyes.right.pupil.x) / 2,
                    y: (analysis.eyes.left.pupil.y + analysis.eyes.right.pupil.y) / 2
                };
            }
        }
    }

    // Update time
    const elapsed = Math.floor((Date.now() - state.exerciseStartTime) / 1000);
    document.getElementById('exerciseTime').textContent = `${elapsed}s`;

    setTimeout(exerciseTrackingLoop, 200);
}

function updateExerciseDisplay(analysis) {
    const dataContainer = document.getElementById('exerciseData');

    dataContainer.innerHTML = `
        <div class="eye-data-item">
            <div class="label">Sol Göz</div>
            <div class="value">${analysis.eyes.left.open ? '👁️ Açık' : '😑 Kapalı'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Sağ Göz</div>
            <div class="value">${analysis.eyes.right.open ? '👁️ Açık' : '😑 Kapalı'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Göz Bebeği X</div>
            <div class="value">${state.lastPupilPosition ? state.lastPupilPosition.x.toFixed(3) : '-'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Göz Bebeği Y</div>
            <div class="value">${state.lastPupilPosition ? state.lastPupilPosition.y.toFixed(3) : '-'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Gözlük</div>
            <div class="value">${analysis.glasses.detected ? '👓 Var' : '✅ Yok'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Landmark Sayısı</div>
            <div class="value">${analysis.face_quality.landmarks_count}</div>
        </div>
    `;

    document.getElementById('gazeDirection').textContent = analysis.gaze.direction.toUpperCase();
}

function stopExercise() {
    state.isTracking = false;
    exerciseSequence = 0;
    showScreen('mainMenu');
}

// Tracking Functions
function startTracking() {
    if (!state.calibrationData) {
        alert('Önce kalibrasyon yapmalısınız!');
        return;
    }

    showScreen('trackingScreen');
    state.isTracking = true;
    state.pupilTrail = [];

    document.getElementById('gazeIndicator').classList.remove('hidden');

    trackingLoop();
}

async function trackingLoop() {
    if (!state.isTracking) return;

    const imageData = await captureImage();
    if (imageData) {
        const result = await detectFace(imageData);

        if (result && result.success && result.face_detected) {
            const analysis = result.analysis;

            // Update tracking display
            updateTrackingDisplay(analysis);

            // Map pupil to screen if eyes are open
            if (analysis.eyes.both_open) {
                const pupilX = (analysis.eyes.left.pupil.x + analysis.eyes.right.pupil.x) / 2;
                const pupilY = (analysis.eyes.left.pupil.y + analysis.eyes.right.pupil.y) / 2;

                state.lastPupilPosition = { x: pupilX, y: pupilY };

                const screenPos = mapPupilToScreen(pupilX, pupilY);
                if (screenPos) {
                    updateGazeIndicator(screenPos.x, screenPos.y);

                    // Add to trail
                    addPupilTrail(screenPos.x, screenPos.y);
                }
            } else {
                // Eyes closed - keep last position
                if (state.lastPupilPosition) {
                    const screenPos = mapPupilToScreen(state.lastPupilPosition.x, state.lastPupilPosition.y);
                    if (screenPos) {
                        updateGazeIndicator(screenPos.x, screenPos.y, true);
                    }
                }
            }
        }
    }

    setTimeout(trackingLoop, 100);
}

function updateGazeIndicator(x, y, dimmed = false) {
    const indicator = document.getElementById('gazeIndicator');
    indicator.style.left = `${x}%`;
    indicator.style.top = `${y}%`;
    indicator.style.opacity = dimmed ? 0.3 : 1;
}

function addPupilTrail(x, y) {
    const container = document.getElementById('trackingContainer');
    const trail = document.createElement('div');
    trail.className = 'pupil-trail';
    trail.style.left = `${x}%`;
    trail.style.top = `${y}%`;
    container.appendChild(trail);

    state.pupilTrail.push(trail);

    // Fade out and remove after 1 second
    setTimeout(() => {
        trail.style.transition = 'opacity 1s';
        trail.style.opacity = '0';
        setTimeout(() => {
            trail.remove();
            state.pupilTrail = state.pupilTrail.filter(t => t !== trail);
        }, 1000);
    }, 100);

    // Limit trail length
    if (state.pupilTrail.length > 20) {
        const oldTrail = state.pupilTrail.shift();
        oldTrail.remove();
    }
}

function updateTrackingDisplay(analysis) {
    const dataContainer = document.getElementById('trackingData');

    const screenPos = state.lastPupilPosition ?
        mapPupilToScreen(state.lastPupilPosition.x, state.lastPupilPosition.y) : null;

    dataContainer.innerHTML = `
        <div class="eye-data-item">
            <div class="label">Sol Göz</div>
            <div class="value">${analysis.eyes.left.open ? '👁️ Açık' : '😑 Kapalı'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Sağ Göz</div>
            <div class="value">${analysis.eyes.right.open ? '👁️ Açık' : '😑 Kapalı'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Bakış Yönü</div>
            <div class="value">${analysis.gaze.direction.toUpperCase()}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Ekran X</div>
            <div class="value">${screenPos ? screenPos.x.toFixed(1) + '%' : '-'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Ekran Y</div>
            <div class="value">${screenPos ? screenPos.y.toFixed(1) + '%' : '-'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Göz Bebeği X</div>
            <div class="value">${state.lastPupilPosition ? state.lastPupilPosition.x.toFixed(3) : '-'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Göz Bebeği Y</div>
            <div class="value">${state.lastPupilPosition ? state.lastPupilPosition.y.toFixed(3) : '-'}</div>
        </div>
        <div class="eye-data-item">
            <div class="label">Gözlük</div>
            <div class="value">${analysis.glasses.detected ? '👓 Var' : '✅ Yok'}</div>
        </div>
    `;
}

function stopTracking() {
    state.isTracking = false;
    document.getElementById('gazeIndicator').classList.add('hidden');

    // Clear trail
    state.pupilTrail.forEach(trail => trail.remove());
    state.pupilTrail = [];

    showScreen('mainMenu');
}
