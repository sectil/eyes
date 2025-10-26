# VisionCare AI Service

Professional eye tracking and face analysis microservice using **MediaPipe** and **OpenCV**.

## Features

- **Real Face Detection** - MediaPipe Face Mesh with 468 facial landmarks
- **Iris Tracking** - Precise pupil detection with 10 additional iris landmarks (478 total)
- **Eye Blink Detection** - Eye Aspect Ratio (EAR) algorithm for real-time blink tracking
- **Pupil Tracking** - Accurate pupil position within eye bounds
- **Gaze Tracking** - Real-time gaze direction detection (center, left, right, up, down)
- **Glasses Detection** - Facial geometry analysis to detect eyewear

## Technology Stack

- **Flask** - REST API framework
- **MediaPipe** - Google's production-ready ML solutions
- **OpenCV** - Computer vision operations
- **NumPy** - Numerical computations
- **Pillow** - Image processing

## Installation

### 1. Create Virtual Environment

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

## Running the Service

### Development Mode

```bash
source venv/bin/activate
python app.py
```

The service will start on `http://0.0.0.0:5000`

### Production Mode

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Health Check

**GET** `/health`

Check service status and capabilities.

**Response:**
```json
{
  "status": "ok",
  "service": "VisionCare AI",
  "version": "1.0.0",
  "capabilities": [
    "face_detection",
    "eye_tracking",
    "blink_detection",
    "pupil_tracking",
    "glasses_detection",
    "iris_landmarks"
  ]
}
```

### Face Detection

**POST** `/api/detect-face`

Analyze face and eyes from base64 encoded image.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2025-10-26T17:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "face_detected": true,
  "timestamp": "2025-10-26T17:30:00Z",
  "analysis": {
    "eyes": {
      "left": {
        "open": true,
        "aspect_ratio": 0.341,
        "pupil": {
          "x": -0.13,
          "y": -0.07,
          "center": [120.5, 180.3]
        }
      },
      "right": {
        "open": true,
        "aspect_ratio": 0.362,
        "pupil": {
          "x": 0.01,
          "y": -0.22,
          "center": [220.8, 178.9]
        }
      },
      "both_open": true,
      "blinking": false
    },
    "gaze": {
      "direction": "center",
      "x": -0.06,
      "y": -0.15
    },
    "glasses": {
      "detected": true,
      "confidence": 0.7
    },
    "face_quality": {
      "landmarks_count": 478,
      "has_iris_tracking": true,
      "detection_confidence": 1.0
    }
  }
}
```

### Calibration

**POST** `/api/calibrate`

Store calibration data for improved tracking accuracy.

**Request:**
```json
{
  "calibration_points": [
    {"x": 0.5, "y": 0.5, "pupil_data": {...}},
    {"x": 0.0, "y": 0.0, "pupil_data": {...}},
    {"x": 1.0, "y": 0.0, "pupil_data": {...}},
    {"x": 0.0, "y": 1.0, "pupil_data": {...}},
    {"x": 1.0, "y": 1.0, "pupil_data": {...}}
  ]
}
```

## Understanding the Response

### Eye Aspect Ratio (EAR)

- **> 0.25** - Eye is open
- **< 0.2** - Eye is closed/blinking
- **0.2 - 0.25** - Transition zone

### Pupil Position

- **x, y range**: -1.0 to 1.0
- **0, 0** - Center of eye
- **Negative x** - Looking left
- **Positive x** - Looking right
- **Negative y** - Looking up
- **Positive y** - Looking down

### Gaze Direction

- `center` - Looking straight ahead
- `left` - Looking left (|x| > 0.3, x < 0)
- `right` - Looking right (|x| > 0.3, x > 0)
- `up` - Looking up (|y| > 0.3, y < 0)
- `down` - Looking down (|y| > 0.3, y > 0)

## Integration Examples

### Mobile App (React Native / Expo)

```javascript
import { Camera } from 'expo-camera';

async function analyzeFrame(camera) {
  // Capture photo
  const photo = await camera.takePictureAsync({
    base64: true,
    quality: 0.7,
  });

  // Send to AI service
  const response = await fetch('http://192.168.1.12:5000/api/detect-face', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/jpeg;base64,${photo.base64}`,
      timestamp: new Date().toISOString(),
    }),
  });

  const result = await response.json();

  if (result.success && result.face_detected) {
    console.log('Eyes open:', result.analysis.eyes.both_open);
    console.log('Gaze direction:', result.analysis.gaze.direction);
    console.log('Wearing glasses:', result.analysis.glasses.detected);
  }
}
```

### Node.js Backend Proxy

```javascript
import express from 'express';
import axios from 'axios';

const app = express();
const AI_SERVICE_URL = 'http://localhost:5000';

app.post('/api/analyze-eyes', async (req, res) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/detect-face`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Python Client

```python
import requests
import base64

def analyze_image(image_path):
    # Read and encode image
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()

    # Send to AI service
    response = requests.post(
        'http://localhost:5000/api/detect-face',
        json={
            'image': f'data:image/jpeg;base64,{image_data}',
            'timestamp': '2025-10-26T17:30:00Z'
        }
    )

    return response.json()
```

## Testing

Run the test suite to verify the service is working:

```bash
source venv/bin/activate
python test_service.py
```

## Performance

- **Detection Time**: ~50-200ms per frame (depending on hardware)
- **Recommended Frame Rate**: 10-30 FPS for real-time tracking
- **Image Size**: 640x480 to 1280x720 (higher resolution = more accurate but slower)

## Architecture

```
┌─────────────┐     HTTP/REST      ┌──────────────┐
│   Mobile    │ ─────────────────> │  AI Service  │
│     App     │ <───────────────── │   (Flask)    │
└─────────────┘     JSON           └──────────────┘
                                           │
                                           │
                                           v
                                    ┌──────────────┐
                                    │  MediaPipe   │
                                    │  Face Mesh   │
                                    └──────────────┘
```

## System Requirements

- **Python**: 3.8 or higher (tested on 3.11)
- **RAM**: Minimum 2GB, recommended 4GB
- **CPU**: Multi-core processor recommended
- **OS**: Linux, macOS, or Windows

## Troubleshooting

### Port Already in Use

```bash
lsof -i :5000
kill -9 <PID>
```

### MediaPipe Installation Issues

If MediaPipe fails to install:
- Ensure Python version is 3.8-3.11 (not 3.14+)
- Update pip: `pip install --upgrade pip`
- Try: `pip install mediapipe --no-cache-dir`

### Low Detection Accuracy

- Ensure good lighting conditions
- Face should be clearly visible and forward-facing
- Increase image resolution (but not beyond 1280x720)
- Run calibration endpoint for personalized tracking

## License

Professional AI solution for VisionCare application.

## Support

For issues or questions, contact the development team.
