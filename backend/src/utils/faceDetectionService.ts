import * as tf from '@tensorflow/tfjs-node';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let detector: any = null;

export async function initializeFaceDetection() {
  if (detector) return detector;
  
  console.log('[AI] Initializing TensorFlow Face Detection...');
  
  await tf.ready();
  
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: 'tfjs' as const,
    refineLandmarks: true,
    maxFaces: 1,
  };
  
  detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
  
  console.log('[AI] Face Detection Model Loaded!');
  return detector;
}

export async function detectFace(imageBase64: string) {
  try {
    if (!detector) {
      await initializeFaceDetection();
    }

    // Base64'ü decode et
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // TensorFlow tensor'a çevir
    const imageTensor = tf.node.decodeImage(imageBuffer, 3);
    
    // Yüz tespiti yap
    const faces = await detector.estimateFaces(imageTensor as any);
    
    // Tensor'ı temizle (memory leak önleme)
    imageTensor.dispose();
    
    if (faces && faces.length > 0) {
      const face = faces[0];
      
      // Göz bilgilerini çıkar
      const leftEyePoints = face.keypoints.filter((kp: any) => 
        kp.name && kp.name.includes('leftEye')
      );
      const rightEyePoints = face.keypoints.filter((kp: any) => 
        kp.name && kp.name.includes('rightEye')
      );
      
      return {
        detected: true,
        faceBox: face.box,
        landmarks: face.keypoints.length,
        eyes: {
          left: {
            detected: leftEyePoints.length > 0,
            points: leftEyePoints.length,
          },
          right: {
            detected: rightEyePoints.length > 0,
            points: rightEyePoints.length,
          },
        },
        // Tüm keypoint'leri gönder (468 landmark)
        keypoints: face.keypoints.map((kp: any) => ({
          x: kp.x,
          y: kp.y,
          name: kp.name,
        })),
      };
    }
    
    return {
      detected: false,
      message: 'No face detected',
    };
  } catch (error) {
    console.error('[AI] Face detection error:', error);
    throw error;
  }
}
