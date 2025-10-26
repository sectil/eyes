import { useRef, useEffect } from 'react'
import gsap from 'gsap'

function Eyelid({ onBlink }) {
  const topLidRef = useRef()
  const bottomLidRef = useRef()
  
  useEffect(() => {
    if (onBlink) {
      // Kırpma animasyonu
      gsap.to(topLidRef.current.position, {
        y: -0.1,
        duration: 0.045,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      })
      
      gsap.to(bottomLidRef.current.position, {
        y: 0.1,
        duration: 0.045,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      })
    }
  }, [onBlink])
  
  return (
    <>
      <mesh ref={topLidRef} position={[0, 0.3, 1]}>
        <boxGeometry args={[2.2, 0.1, 0.1]} />
        <meshStandardMaterial color={0xffdbac} />
      </mesh>
      
      <mesh ref={bottomLidRef} position={[0, -0.3, 1]}>
        <boxGeometry args={[2.2, 0.1, 0.1]} />
        <meshStandardMaterial color={0xffdbac} />
      </mesh>
    </>
  )
}

export default Eyelid
