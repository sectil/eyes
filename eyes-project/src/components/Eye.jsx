import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Eye({ pupilPosition = { x: 0, y: 0 } }) {
  const scleraRef = useRef()
  const corneaRef = useRef()
  const irisRef = useRef()
  const pupilRef = useRef()
  const { camera } = useThree()
  
  // Kahverengi iris shader
  const irisVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  
  const irisFragmentShader = `
    uniform vec3 uIrisColor;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      vec2 center = vec2(0.5);
      vec2 dir = vUv - center;
      float dist = length(dir);
      float angle = atan(dir.y, dir.x);
      
      // Radyal iris deseni
      float fibers = sin(angle * 40.0 + dist * 10.0) * 0.5 + 0.5;
      
      // Noise ile organik görünüm
      float noise = hash(vUv * 50.0) * 0.3;
      fibers = mix(fibers, noise, 0.3);
      
      // Kahverengi ton gradyanı
      vec3 brownBase = vec3(0.35, 0.20, 0.10);
      vec3 brownLight = vec3(0.55, 0.35, 0.20);
      vec3 irisColor = mix(brownBase, brownLight, fibers);
      
      // Radyal gradient - merkez daha açık
      float radialGradient = smoothstep(0.0, 0.5, dist);
      irisColor = mix(irisColor * 1.3, irisColor, radialGradient);
      
      // Limbal ring (dış koyu halka)
      float limbal = smoothstep(0.45, 0.5, dist);
      irisColor = mix(irisColor, vec3(0.1, 0.05, 0.02), limbal);
      
      // Fresnel parlaması
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      irisColor += fresnel * 0.15;
      
      gl_FragColor = vec4(irisColor, 1.0);
    }
  `
  
  // Kornea shader
  const corneaVertexShader = `
    varying vec3 vNormal;
    varying vec3 vEyeVector;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vEyeVector = normalize(position - cameraPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  
  const corneaFragmentShader = `
    varying vec3 vNormal;
    varying vec3 vEyeVector;
    
    void main() {
      // Fresnel efekti - kornea ıslaklığı
      float fresnel = pow(1.0 - abs(dot(vNormal, vEyeVector)), 3.0);
      
      // Speküler parıltı
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float spec = pow(max(dot(reflect(-vEyeVector, vNormal), lightDir), 0.0), 32.0);
      
      vec3 color = vec3(1.0) * (fresnel * 0.3 + spec * 0.7);
      gl_FragColor = vec4(color, fresnel * 0.4);
    }
  `
  
  // Materialları oluştur
  const irisMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: irisVertexShader,
      fragmentShader: irisFragmentShader,
      uniforms: {
        uIrisColor: { value: new THREE.Color(0x8B6914) },
        uTime: { value: 0 }
      },
      side: THREE.DoubleSide
    })
  }, [])
  
  const corneaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: corneaVertexShader,
      fragmentShader: corneaFragmentShader,
      transparent: true,
      depthTest: true
    })
  }, [])
  
  // Sclera materyal
  const scleraMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.0
    })
  }, [])
  
  // Pupil materyal
  const pupilMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x000000
    })
  }, [])
  
  // Pupil takibi
  useFrame(() => {
    if (irisRef.current && pupilRef.current) {
      // Hedef pozisyon
      const targetX = pupilPosition.x * 0.15
      const targetY = pupilPosition.y * 0.15
      
      // Lerp ile yumuşak hareket
      irisRef.current.position.x += (targetX - irisRef.current.position.x) * 0.1
      irisRef.current.position.y += (targetY - irisRef.current.position.y) * 0.1
      
      pupilRef.current.position.x = irisRef.current.position.x
      pupilRef.current.position.y = irisRef.current.position.y
      
      // Şader zamanını güncelle
      if (irisMaterial.uniforms) {
        irisMaterial.uniforms.uTime.value += 0.016
      }
    }
  })
  
  return (
    <group>
      {/* Sclera (göz beyazı) */}
      <mesh ref={scleraRef} geometry={new THREE.SphereGeometry(1.0, 32, 16)} material={scleraMaterial} />
      
      {/* Iris */}
      <mesh 
        ref={irisRef} 
        position={[0, 0, 0.99]} 
        geometry={new THREE.CircleGeometry(0.3, 32)} 
        material={irisMaterial}
        rotation={[0, 0, 0]}
      />
      
      {/* Pupil */}
      <mesh 
        ref={pupilRef} 
        position={[0, 0, 0.995]} 
        geometry={new THREE.CircleGeometry(0.15, 32)} 
        material={pupilMaterial}
      />
      
      {/* Purkinje görüntüsü (göz parıltısı) */}
      <mesh position={[0.08, 0.1, 1.05]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.6} />
      </mesh>
      
      <mesh position={[-0.05, -0.05, 1.04]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.3} />
      </mesh>
      
      {/* Kornea (şeffaf katman) */}
      <mesh 
        geometry={new THREE.SphereGeometry(1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5)}
        material={corneaMaterial}
        position={[0, 0, 0]}
      />
    </group>
  )
}

export default Eye
