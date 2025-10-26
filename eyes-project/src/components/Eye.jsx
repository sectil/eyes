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

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    void main() {
      vec2 center = vec2(0.5);
      vec2 dir = vUv - center;
      float dist = length(dir);
      float angle = atan(dir.y, dir.x);

      // Daha detaylı iris deseni
      float fibers = 0.0;
      for (float i = 0.0; i < 3.0; i++) {
        fibers += sin(angle * (30.0 + i * 10.0) + dist * 15.0 + uTime * 0.1) * (0.5 / (i + 1.0));
      }
      fibers = fibers * 0.5 + 0.5;

      // Organik noise katmanları
      float n1 = noise(vUv * 80.0 + vec2(uTime * 0.01));
      float n2 = noise(vUv * 150.0 - vec2(uTime * 0.005));
      float detailNoise = n1 * 0.4 + n2 * 0.3;

      // Daha canlı renk paleti
      vec3 color1 = vec3(0.2, 0.5, 0.8);  // Mavi
      vec3 color2 = vec3(0.4, 0.8, 0.9);  // Açık turkuaz
      vec3 color3 = vec3(0.1, 0.3, 0.6);  // Koyu mavi
      vec3 amber = vec3(0.8, 0.6, 0.2);   // Altın amber

      // Renkli iris deseni
      vec3 irisColor = mix(color1, color2, fibers);
      irisColor = mix(irisColor, color3, detailNoise);
      irisColor = mix(irisColor, amber, noise(vUv * 100.0) * 0.3);

      // Radyal gradient - merkez ışıltısı
      float radialGradient = smoothstep(0.0, 0.4, dist);
      vec3 centerGlow = vec3(0.9, 0.95, 1.0);
      irisColor = mix(centerGlow, irisColor, radialGradient);

      // Limbal ring (dış parlak halka)
      float limbal = smoothstep(0.42, 0.48, dist);
      vec3 limbalColor = vec3(0.05, 0.15, 0.3);
      irisColor = mix(irisColor, limbalColor, limbal);

      // Dış kenar parlaması
      float edgeGlow = smoothstep(0.48, 0.5, dist);
      irisColor = mix(irisColor, vec3(0.3, 0.5, 0.7), edgeGlow * 0.5);

      // Fresnel ve speküler parlaması
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      irisColor += vec3(0.6, 0.7, 0.9) * fresnel * 0.3;

      // Dinamik parıltı efekti
      float sparkle = noise(vUv * 200.0 + uTime * 0.5) * noise(vUv * 150.0 - uTime * 0.3);
      irisColor += vec3(1.0, 1.0, 1.0) * sparkle * 0.1;

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
  
  // Sclera materyal - daha gerçekçi göz beyazı
  const scleraMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xfcf9f5,
      roughness: 0.6,
      metalness: 0.0,
      emissive: 0xfff8f0,
      emissiveIntensity: 0.05
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
      
      {/* Purkinje görüntüsü (göz parıltısı) - Ana parlama */}
      <mesh position={[0.12, 0.15, 1.06]}>
        <circleGeometry args={[0.1, 20]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.85} />
      </mesh>

      {/* İkincil parlamalar */}
      <mesh position={[-0.08, -0.08, 1.045]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color={0xe0f0ff} transparent opacity={0.4} />
      </mesh>

      <mesh position={[0.05, -0.1, 1.04]}>
        <circleGeometry args={[0.03, 12]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.25} />
      </mesh>

      {/* Işık yansıması halkası */}
      <mesh position={[0, 0, 1.055]} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.28, 0.32, 32]} />
        <meshBasicMaterial color={0x88ccff} transparent opacity={0.15} side={THREE.DoubleSide} />
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
