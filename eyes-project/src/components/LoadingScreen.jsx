import { Html, useProgress } from '@react-three/drei'

function LoadingScreen() {
  const { progress } = useProgress()
  
  return (
    <Html center>
      <div style={{
        color: 'white',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        letterSpacing: '2px'
      }}>
        <div style={{ marginBottom: '20px', fontWeight: '300' }}>
          Göz Yükleniyor...
        </div>
        <div style={{ 
          fontSize: '18px', 
          opacity: 0.7,
          fontWeight: '200'
        }}>
          %{progress.toFixed(0)}
        </div>
        <div style={{
          marginTop: '20px',
          height: '3px',
          width: '200px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#fff',
            transition: 'width 0.2s ease'
          }} />
        </div>
      </div>
    </Html>
  )
}

export default LoadingScreen
