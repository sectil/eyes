"""
Test script for VisionCare AI Service
Creates a test face image and sends it to the API
"""

import requests
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image, ImageDraw


def create_test_image():
    """Create a simple test image with face-like features"""
    # Create a blank image
    img = np.ones((480, 640, 3), dtype=np.uint8) * 255

    # Draw a simple face
    cv2.circle(img, (320, 240), 100, (255, 200, 200), -1)  # Face

    # Eyes
    cv2.circle(img, (280, 220), 15, (100, 100, 100), -1)  # Left eye
    cv2.circle(img, (360, 220), 15, (100, 100, 100), -1)  # Right eye

    # Pupils
    cv2.circle(img, (280, 220), 5, (0, 0, 0), -1)  # Left pupil
    cv2.circle(img, (360, 220), 5, (0, 0, 0), -1)  # Right pupil

    # Nose
    cv2.ellipse(img, (320, 250), (10, 15), 0, 0, 180, (200, 150, 150), -1)

    # Mouth
    cv2.ellipse(img, (320, 280), (30, 20), 0, 0, 180, (150, 100, 100), 2)

    return img


def image_to_base64(image):
    """Convert numpy image to base64 string"""
    # Convert BGR to RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Convert to PIL Image
    pil_image = Image.fromarray(rgb_image)

    # Convert to base64
    buffered = BytesIO()
    pil_image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    return f"data:image/jpeg;base64,{img_str}"


def test_health_check():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("Testing Health Check...")
    print("="*60)

    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✓ Health check passed!")
            print(f"  Service: {data.get('service')}")
            print(f"  Version: {data.get('version')}")
            print(f"  Status: {data.get('status')}")
            print(f"  Capabilities: {', '.join(data.get('capabilities', []))}")
            return True
        else:
            print(f"✗ Health check failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False


def test_face_detection():
    """Test face detection endpoint"""
    print("\n" + "="*60)
    print("Testing Face Detection with synthetic image...")
    print("="*60)

    try:
        # Create test image
        test_img = create_test_image()

        # Convert to base64
        base64_img = image_to_base64(test_img)

        # Send request
        response = requests.post(
            'http://localhost:5000/api/detect-face',
            json={
                'image': base64_img,
                'timestamp': '2025-10-26T17:30:00Z'
            },
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✓ API Response received!")
            print(f"  Success: {data.get('success')}")
            print(f"  Face detected: {data.get('face_detected')}")

            if data.get('face_detected'):
                analysis = data.get('analysis', {})

                # Eyes
                eyes = analysis.get('eyes', {})
                print(f"\n  Eyes Analysis:")
                print(f"    Both open: {eyes.get('both_open')}")
                print(f"    Blinking: {eyes.get('blinking')}")
                print(f"    Left eye aspect ratio: {eyes.get('left', {}).get('aspect_ratio', 0):.3f}")
                print(f"    Right eye aspect ratio: {eyes.get('right', {}).get('aspect_ratio', 0):.3f}")

                # Pupil tracking
                left_pupil = eyes.get('left', {}).get('pupil', {})
                right_pupil = eyes.get('right', {}).get('pupil', {})
                print(f"\n  Pupil Tracking:")
                print(f"    Left pupil: x={left_pupil.get('x', 0):.2f}, y={left_pupil.get('y', 0):.2f}")
                print(f"    Right pupil: x={right_pupil.get('x', 0):.2f}, y={right_pupil.get('y', 0):.2f}")

                # Gaze
                gaze = analysis.get('gaze', {})
                print(f"\n  Gaze Tracking:")
                print(f"    Direction: {gaze.get('direction')}")
                print(f"    Position: x={gaze.get('x', 0):.2f}, y={gaze.get('y', 0):.2f}")

                # Glasses
                glasses = analysis.get('glasses', {})
                print(f"\n  Glasses Detection:")
                print(f"    Wearing glasses: {glasses.get('detected')}")
                print(f"    Confidence: {glasses.get('confidence', 0):.1%}")

                # Quality
                quality = analysis.get('face_quality', {})
                print(f"\n  Detection Quality:")
                print(f"    Landmarks: {quality.get('landmarks_count')}")
                print(f"    Iris tracking: {quality.get('has_iris_tracking')}")

            else:
                print(f"  Message: {data.get('message')}")

            return True
        else:
            print(f"✗ API request failed with status: {response.status_code}")
            print(f"  Response: {response.text}")
            return False

    except Exception as e:
        print(f"✗ Test error: {e}")
        return False


if __name__ == '__main__':
    print("\n" + "="*60)
    print("VisionCare AI Service - Test Suite")
    print("="*60)

    # Test health check
    health_ok = test_health_check()

    if health_ok:
        # Test face detection
        test_face_detection()
    else:
        print("\n⚠ Skipping face detection test - service not available")
        print("\nMake sure the AI service is running:")
        print("  cd ai-service")
        print("  source venv/bin/activate")
        print("  python app.py")

    print("\n" + "="*60)
    print("Test suite completed!")
    print("="*60 + "\n")
