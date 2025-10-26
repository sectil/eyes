import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import * as tf from '@tensorflow/tfjs'
import Eye from './components/Eye'
import Eyelid from './components/Eyelid'
import LoadingScreen from './components/LoadingScreen'
import BlinkDetector from './utils/BlinkDetector'
import EyeSmoothing from './utils/EyeSmoothing'
import './App.css'

function App() {
  const videoRef = useRef(null)
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 })
  const [blinkState, setBlinkState] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [cameraPermission, setCameraPermission] = useState(null)
  const [eyeScale, setEyeScale] = useState(1)
  const [cameraFov, setCameraFov] = useState(50)

  const modelRef = useRef(null)
  const blinkDetectorRef = useRef(new BlinkDetector())
  const eyeSmoothingRef = useRef(new EyeSmoothing(0.4))
  const requestAnimationFrameIdRef = useRef(null)
  const streamRef = useRef(null)  // iOS için stream ref

  // Kamera başlatma - iOS MOBILE OPTIMIZED
  useEffect(() => {
    const setupCamera = async () => {
      try {
        // iOS Safari için optimize edilmiş video ayarları
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            facingMode: 'user',
            frameRate: { ideal: 15, max: 20 }  // iOS battery için düşük FPS
          },
          audio: false
        })

        streamRef.current = stream  // Ref'e kaydet

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute('playsinline', 'true')  // iOS için critical
          videoRef.current.setAttribute('webkit-playsinline', 'true')
          setCameraPermission(true)
          console.log('📹 Kamera başlatıldı (iOS optimized)')
        }
      } catch (error) {
        console.error('❌ Kamera erişimi reddedildi:', error)
        setCameraPermission(false)
      }
    }

    setupCamera()

    // Cleanup - iOS için önemli (memory leak önler)
    return () => {
      try {
        if (streamRef.current?.getTracks) {
          streamRef.current.getTracks().forEach(track => {
            if (track && typeof track.stop === 'function') {
              track.stop()
              console.log('🛑 Kamera track durduruldu')
            }
          })
          streamRef.current = null
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      } catch (error) {
        console.warn('Cleanup error (safe to ignore):', error)
      }
    }
  }, [])

  // Ekran boyutuna göre otomatik ölçeklendirme
  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Ekran boyutuna göre göz ölçeği
      // Küçük ekranlar (telefon): 0.6-0.8
      // Orta ekranlar (tablet): 0.8-1.0
      // Büyük ekranlar: 1.0-1.2
      let scale = 1.0
      let fov = 50

      if (width < 375) {
        // Çok küçük telefonlar
        scale = 0.55
        fov = 60
      } else if (width < 425) {
        // Küçük telefonlar
        scale = 0.65
        fov = 58
      } else if (width < 768) {
        // Orta boy telefonlar
        scale = 0.75
        fov = 55
      } else if (width < 1024) {
        // Büyük telefonlar / küçük tabletler
        scale = 0.9
        fov = 52
      } else if (width < 1440) {
        // Tabletler
        scale = 1.0
        fov = 50
      } else {
        // Büyük ekranlar
        scale = 1.2
        fov = 48
      }

      // Yükseklik/genişlik oranına göre ince ayar
      const aspectRatio = height / width
      if (aspectRatio > 1.8) {
        // Çok uzun ekranlar (modern telefonlar)
        scale *= 0.9
      }

      setEyeScale(scale)
      setCameraFov(fov)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    window.addEventListener('orientationchange', updateScale)

    return () => {
      window.removeEventListener('resize', updateScale)
      window.removeEventListener('orientationchange', updateScale)
    }
  }, [])

  // TensorFlow.js modeli yükleme - iOS MOBILE OPTIMIZED
  useEffect(() => {
    let isSubscribed = true

    const loadModel = async () => {
      try {
        await tf.ready()

        // iOS için WebGL backend kullan
        await tf.setBackend('webgl')

        const model = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            maxFaces: 1,
            refineLandmarks: false,  // iOS'ta performans için kapalı
            detectorModelUrl: undefined,  // Default lightweight model
          }
        )

        if (isSubscribed) {
          modelRef.current = model
          setIsModelLoaded(true)
          console.log('✅ iOS için optimize edilmiş model yüklendi')
          console.log('📱 Memory:', tf.memory())
        } else {
          // Component unmount olduysa model'i hemen temizle
          model.dispose?.()
        }
      } catch (error) {
        console.error('Model yüklenirken hata:', error)
      }
    }

    loadModel()

    // Cleanup - memory leak önleme
    return () => {
      isSubscribed = false
      if (modelRef.current) {
        try {
          modelRef.current.dispose?.()
          console.log('🧹 Model temizlendi')
        } catch (e) {
          console.warn('Model cleanup error (safe to ignore):', e)
        }
        modelRef.current = null
      }
    }
  }, [])
  
  // Yüz tespiti ve göz takibi - iOS MOBILE OPTIMIZED
  useEffect(() => {
    let frameCount = 0
    let lastDetectionTime = 0
    const DETECTION_INTERVAL = 100 // iOS için 100ms (10 FPS) - battery saving

    const detectFace = async () => {
      if (!modelRef.current || !videoRef.current || !cameraPermission) {
        requestAnimationFrameIdRef.current = requestAnimationFrame(detectFace)
        return
      }

      // Video'nun tamamen yüklendiğinden emin ol
      const video = videoRef.current
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        requestAnimationFrameIdRef.current = requestAnimationFrame(detectFace)
        return
      }

      // İlk kez video boyutlarını log'la
      if (frameCount === 0) {
        console.log('📹 Video boyutları:', video.videoWidth, 'x', video.videoHeight)
        console.log('📹 Video readyState:', video.readyState)
      }

      // iOS için FPS throttling - her frame değil
      const now = Date.now()
      if (now - lastDetectionTime < DETECTION_INTERVAL) {
        requestAnimationFrameIdRef.current = requestAnimationFrame(detectFace)
        return
      }
      lastDetectionTime = now

      try {
        // TensorFlow.js inference - flipHorizontal true olmalı!
        const predictions = await modelRef.current.estimateFaces(video, {
          flipHorizontal: true  // iOS ön kamera için önemli
        })

        frameCount++
        if (frameCount % 30 === 0) {
          console.log(`🎥 Frame ${frameCount}: ${predictions.length} yüz | Memory:`, tf.memory().numTensors)
          if (predictions.length === 0) {
            console.warn('⚠️ Hiç yüz tespit edilmiyor! Yüzünüz kamerada görünüyor mu?')
          }
        }

        if (predictions.length > 0) {
          const face = predictions[0]
          const keypoints = face.keypoints

          if (!keypoints || keypoints.length < 468) {
            console.warn('⚠️ Yeterli keypoint yok:', keypoints?.length)
            requestAnimationFrameIdRef.current = requestAnimationFrame(detectFace)
            return
          }

          // Sadece göz keypoints - memory için minimize
          const leftEyeIndices = [33, 160, 158, 133, 153, 144]
          const rightEyeIndices = [362, 385, 387, 263, 373, 380]

          const leftEye = leftEyeIndices.map(i => [keypoints[i].x, keypoints[i].y])
          const rightEye = rightEyeIndices.map(i => [keypoints[i].x, keypoints[i].y])
          
          // Göz merkezi hesapla
          if (leftEye && leftEye.length > 0 && rightEye && rightEye.length > 0) {
            const leftEyeCenter = {
              x: leftEye.reduce((sum, p) => sum + p[0], 0) / leftEye.length,
              y: leftEye.reduce((sum, p) => sum + p[1], 0) / leftEye.length
            }
            
            const rightEyeCenter = {
              x: rightEye.reduce((sum, p) => sum + p[0], 0) / rightEye.length,
              y: rightEye.reduce((sum, p) => sum + p[1], 0) / rightEye.length
            }
            
            // Video merkezi
            const videoCenter = {
              x: videoRef.current.videoWidth / 2,
              y: videoRef.current.videoHeight / 2
            }
            
            // Göz pozisyonunu normalleştir (-1 ile 1 arasında)
            const rawX = (leftEyeCenter.x - videoCenter.x) / (videoCenter.x * 0.5)
            const rawY = (leftEyeCenter.y - videoCenter.y) / (videoCenter.y * 0.5)
            
            // Yumuşat
            const smoothed = eyeSmoothingRef.current.smooth(rawX, rawY)
            setPupilPosition({ x: smoothed.x, y: -smoothed.y })
            
            // Kırpma tespiti
            const blinkResult = blinkDetectorRef.current.updateBlink(leftEye, rightEye)
            setBlinkState(blinkResult.blinkDetected)
          }
        }
        
        requestAnimationFrameIdRef.current = requestAnimationFrame(detectFace)
      } catch (error) {
        console.error('Yüz tespiti hatası:', error)
        requestAnimationFrameIdRef.current = requestAnimationFrame(detectFace)
      }
    }
    
    if (isModelLoaded) {
      detectFace()
    }
    
    return () => {
      if (requestAnimationFrameIdRef.current) {
        cancelAnimationFrame(requestAnimationFrameIdRef.current)
      }
    }
  }, [isModelLoaded, cameraPermission])
  
  return (
    <div className="app-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        webkit-playsinline="true"
        className="camera-feed"
        style={{ objectFit: 'cover' }}
      />
      
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: cameraFov }}
        className="canvas"
        dpr={[1, 1.5]}  // iOS için pixel ratio limit - memory save
        performance={{ min: 0.5 }}  // Auto performance adjustment
        gl={{
          antialias: false,  // iOS performance
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        {/* Işıklandırma - iOS için optimize */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[0, 0, 5]} intensity={0.4} color="#ffffff" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!cameraPermission}
          autoRotateSpeed={2}
        />

        <group scale={[eyeScale, eyeScale, eyeScale]}>
          <Eye pupilPosition={pupilPosition} />
          <Eyelid onBlink={blinkState} />
        </group>

        {!isModelLoaded && <LoadingScreen />}
      </Canvas>
      
      <div className="info-panel">
        <div className="status">
          {cameraPermission === null && <span>Kamera başlatılıyor...</span>}
          {cameraPermission === false && <span className="error">❌ Kamera erişimi reddedildi</span>}
          {cameraPermission === true && !isModelLoaded && <span>⏳ Model yükleniyor...</span>}
          {isModelLoaded && <span className="success">✅ Canlı takip aktif</span>}
        </div>
      </div>
    </div>
  )
}

export default App
