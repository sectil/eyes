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
  
  // Kamera başlatma
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user' 
          },
          audio: false
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraPermission(true)
        }
      } catch (error) {
        console.log('Kamera erişimi reddedildi:', error)
        setCameraPermission(false)
      }
    }
    
    setupCamera()
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

  // MediaPipe modeli yükleme
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await faceLandmarksDetection.load(
          faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        )
        modelRef.current = model
        setIsModelLoaded(true)
      } catch (error) {
        console.error('Model yüklenirken hata:', error)
      }
    }
    
    loadModel()
  }, [])
  
  // Yüz tespiti ve göz takibi
  useEffect(() => {
    const detectFace = async () => {
      if (!modelRef.current || !videoRef.current || !cameraPermission) return
      
      try {
        const predictions = await modelRef.current.estimateFaces({
          input: videoRef.current,
          returnRawCoordinates: false,
        })
        
        if (predictions.length > 0) {
          const face = predictions[0]
          
          // Sol göz ve sağ göz landmark'ları
          const leftEye = face.annotations.leftEye
          const rightEye = face.annotations.rightEye
          
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
        className="camera-feed"
      />
      
      <Canvas camera={{ position: [0, 0, 2.5], fov: cameraFov }} className="canvas">
        {/* Işıklandırma */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />

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
