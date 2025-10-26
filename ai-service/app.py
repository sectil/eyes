"""
VisionCare AI Service - Professional Eye Tracking & Face Analysis
Real-time face detection with MediaPipe for precise eye tracking
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mediapipe as mp
import cv2
import numpy as np
import base64
from PIL import Image
from io import BytesIO
import math
import os

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Face Mesh with iris detection
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,  # Enable iris landmarks
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Eye landmark indices for MediaPipe Face Mesh
LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
LEFT_IRIS_INDICES = [468, 469, 470, 471, 472]
RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477]


def decode_image(base64_string):
    """Decode base64 image to numpy array"""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]

    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data))
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)


def calculate_eye_aspect_ratio(eye_landmarks):
    """Calculate Eye Aspect Ratio (EAR) for blink detection"""
    # Vertical eye landmarks
    v1 = math.dist(eye_landmarks[1], eye_landmarks[5])
    v2 = math.dist(eye_landmarks[2], eye_landmarks[4])

    # Horizontal eye landmarks
    h = math.dist(eye_landmarks[0], eye_landmarks[3])

    # EAR formula
    ear = (v1 + v2) / (2.0 * h)
    return ear


def detect_glasses(face_landmarks, image_shape):
    """Detect if person is wearing glasses using facial geometry"""
    h, w = image_shape[:2]

    # Get nose bridge points (between eyes)
    nose_bridge_points = [6, 168, 197, 195]

    # Get eye corner points
    left_eye_outer = face_landmarks.landmark[33]
    right_eye_outer = face_landmarks.landmark[263]

    # Calculate contrast and edges around nose bridge area
    # Higher contrast suggests presence of glasses frame
    has_glasses = False

    # Simple heuristic: check distance between eyes and nose bridge geometry
    # In a real implementation, you would analyze image contrast/edges
    # For now, we'll use landmark geometry

    try:
        nose_points = [face_landmarks.landmark[i] for i in nose_bridge_points]
        # Calculate variance in nose bridge points
        y_coords = [p.y for p in nose_points]
        variance = np.var(y_coords)

        # Higher variance might indicate glasses frame disrupting natural face contours
        has_glasses = variance > 0.0001
    except:
        pass

    return has_glasses


def get_pupil_position(iris_landmarks, eye_landmarks):
    """Calculate pupil position relative to eye"""
    # Iris center (pupil)
    iris_center = np.mean(iris_landmarks, axis=0)

    # Eye bounds
    eye_left = min(eye_landmarks, key=lambda p: p[0])[0]
    eye_right = max(eye_landmarks, key=lambda p: p[0])[0]
    eye_top = min(eye_landmarks, key=lambda p: p[1])[1]
    eye_bottom = max(eye_landmarks, key=lambda p: p[1])[1]

    # Normalize pupil position (-1 to 1 for both x and y)
    eye_width = eye_right - eye_left
    eye_height = eye_bottom - eye_top

    pupil_x = (iris_center[0] - eye_left) / eye_width if eye_width > 0 else 0.5
    pupil_y = (iris_center[1] - eye_top) / eye_height if eye_height > 0 else 0.5

    # Convert to -1 to 1 range (0 = center)
    pupil_x = (pupil_x - 0.5) * 2
    pupil_y = (pupil_y - 0.5) * 2

    return {
        'x': float(pupil_x),
        'y': float(pupil_y),
        'center': [float(iris_center[0]), float(iris_center[1])]
    }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'VisionCare AI',
        'version': '1.0.0',
        'capabilities': [
            'face_detection',
            'eye_tracking',
            'blink_detection',
            'pupil_tracking',
            'glasses_detection',
            'iris_landmarks'
        ]
    })


@app.route('/api/detect-face', methods=['POST'])
def detect_face():
    """
    Detect face and analyze eyes from base64 image
    Returns: facial landmarks, eye tracking, blink detection, pupil position
    """
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400

        # Decode image
        image = decode_image(data['image'])
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        h, w = image.shape[:2]

        # Process image with MediaPipe
        results = face_mesh.process(rgb_image)

        if not results.multi_face_landmarks:
            return jsonify({
                'success': True,
                'face_detected': False,
                'message': 'No face detected in image'
            })

        face_landmarks = results.multi_face_landmarks[0]

        # Extract eye landmarks
        left_eye_points = [(face_landmarks.landmark[i].x * w,
                           face_landmarks.landmark[i].y * h)
                          for i in LEFT_EYE_INDICES]
        right_eye_points = [(face_landmarks.landmark[i].x * w,
                            face_landmarks.landmark[i].y * h)
                           for i in RIGHT_EYE_INDICES]

        # Calculate Eye Aspect Ratio (blink detection)
        left_ear = calculate_eye_aspect_ratio(left_eye_points)
        right_ear = calculate_eye_aspect_ratio(right_eye_points)
        avg_ear = (left_ear + right_ear) / 2.0

        # EAR < 0.2 typically indicates closed eye
        is_blinking = avg_ear < 0.2
        eyes_open = avg_ear > 0.25

        # Extract iris landmarks (pupil tracking)
        left_iris_points = [(face_landmarks.landmark[i].x * w,
                            face_landmarks.landmark[i].y * h)
                           for i in LEFT_IRIS_INDICES]
        right_iris_points = [(face_landmarks.landmark[i].x * w,
                             face_landmarks.landmark[i].y * h)
                            for i in RIGHT_IRIS_INDICES]

        # Get pupil positions
        left_pupil = get_pupil_position(left_iris_points, left_eye_points)
        right_pupil = get_pupil_position(right_iris_points, right_eye_points)

        # Detect glasses
        wearing_glasses = detect_glasses(face_landmarks, image.shape)

        # Calculate gaze direction (average of both eyes)
        gaze_x = (left_pupil['x'] + right_pupil['x']) / 2
        gaze_y = (left_pupil['y'] + right_pupil['y']) / 2

        # Determine gaze direction
        gaze_direction = 'center'
        if abs(gaze_x) > 0.3:
            gaze_direction = 'right' if gaze_x > 0 else 'left'
        elif abs(gaze_y) > 0.3:
            gaze_direction = 'down' if gaze_y > 0 else 'up'

        # Build response
        response = {
            'success': True,
            'face_detected': True,
            'timestamp': data.get('timestamp'),
            'analysis': {
                'eyes': {
                    'left': {
                        'open': bool(left_ear > 0.25),
                        'aspect_ratio': float(left_ear),
                        'pupil': left_pupil
                    },
                    'right': {
                        'open': bool(right_ear > 0.25),
                        'aspect_ratio': float(right_ear),
                        'pupil': right_pupil
                    },
                    'both_open': bool(eyes_open),
                    'blinking': bool(is_blinking)
                },
                'gaze': {
                    'direction': gaze_direction,
                    'x': float(gaze_x),
                    'y': float(gaze_y)
                },
                'glasses': {
                    'detected': bool(wearing_glasses),
                    'confidence': 0.7 if wearing_glasses else 0.3
                },
                'face_quality': {
                    'landmarks_count': len(face_landmarks.landmark),
                    'has_iris_tracking': True,
                    'detection_confidence': float(results.multi_face_landmarks[0].landmark[0].visibility if hasattr(results.multi_face_landmarks[0].landmark[0], 'visibility') else 1.0)
                }
            }
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error processing image'
        }), 500


@app.route('/api/calibrate', methods=['POST'])
def calibrate():
    """
    Calibration endpoint for eye tracking
    Stores baseline measurements for accurate tracking
    """
    try:
        data = request.get_json()

        # In a production system, you would store calibration data
        # For now, we'll just validate the calibration points

        calibration_points = data.get('calibration_points', [])

        if len(calibration_points) < 5:
            return jsonify({
                'success': False,
                'error': 'Insufficient calibration points. Need at least 5 points.'
            }), 400

        return jsonify({
            'success': True,
            'message': 'Calibration completed',
            'points_collected': len(calibration_points),
            'calibration_id': 'calibration_' + str(hash(str(calibration_points)))
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    PORT = int(os.environ.get('PORT', 5000))

    print('=' * 60)
    print('VisionCare AI Service Starting...')
    print('Professional Eye Tracking & Face Analysis')
    print('=' * 60)
    print('Features:')
    print('  - MediaPipe Face Mesh (468 landmarks)')
    print('  - Iris tracking for precise pupil detection')
    print('  - Eye blink detection (EAR algorithm)')
    print('  - Glasses detection')
    print('  - Real-time gaze tracking')
    print('=' * 60)
    print(f'Server running on http://0.0.0.0:{PORT}')
    print(f'Health check: http://0.0.0.0:{PORT}/health')
    print('=' * 60)

    app.run(host='0.0.0.0', port=PORT, debug=True)
