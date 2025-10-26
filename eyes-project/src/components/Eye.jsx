import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Eye({ pupilPosition = { x: 0, y: 0 } }) {
  const scleraRef = useRef()
  const corneaRef = useRef()
  const irisRef = useRef()
  const pupilRef = useRef()
  const { camera } = useThree()
  
  // Modern güzel iris shader
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

    void main() {
      vec2 center = vec2(0.5);
      vec2 dir = vUv - center;
      float dist = length(dir);
      float angle = atan(dir.y, dir.x);

      // Modern parlak renkler - Turkuaz/Aqua
      vec3 innerColor = vec3(0.4, 0.9, 1.0);    // Parlak açık mavi
      vec3 midColor = vec3(0.2, 0.7, 0.95);     // Turkuaz
      vec3 outerColor = vec3(0.15, 0.5, 0.85);  // Koyu mavi

      // Temiz radyal gradient
      vec3 irisColor = innerColor;
      irisColor = mix(irisColor, midColor, smoothstep(0.0, 0.35, dist));
      irisColor = mix(irisColor, outerColor, smoothstep(0.35, 0.45, dist));

      // İnce radyal hatlar (minimal)
      float lines = sin(angle * 60.0) * 0.03;
      irisColor += lines;

      // Parıldayan halka efekti
      float ring1 = smoothstep(0.22, 0.24, dist) * (1.0 - smoothstep(0.24, 0.26, dist));
      irisColor += vec3(0.6, 1.0, 1.0) * ring1 * 0.4;

      // Limbal ring - koyu dış halka
      float limbal = smoothstep(0.45, 0.48, dist);
      irisColor = mix(irisColor, vec3(0.05, 0.2, 0.35), limbal);

      // Dış kenar parlak halka
      float outerRing = smoothstep(0.48, 0.49, dist) * (1.0 - smoothstep(0.49, 0.5, dist));
      irisColor += vec3(0.3, 0.8, 1.0) * outerRing * 0.6;

      // Işıltı efekti
      float glow = (1.0 - dist * 1.5) * 0.3;
      irisColor += vec3(1.0, 1.0, 1.0) * glow;

      // Fresnel parlaklık
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
      irisColor += vec3(0.8, 1.0, 1.0) * fresnel * 0.2;

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
  
  // Sclera materyal - temiz göz beyazı
  const scleraMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.0,
      emissive: 0xffffff,
      emissiveIntensity: 0.1
    })
  }, [])

  // Pupil materyal - derin siyah
  const pupilMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.3,
      metalness: 0.0,
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
      
      {/* Iris - daha büyük */}
      <mesh
        ref={irisRef}
        position={[0, 0, 0.99]}
        geometry={new THREE.CircleGeometry(0.38, 40)}
        material={irisMaterial}
        rotation={[0, 0, 0]}
      />

      {/* Pupil - orantılı */}
      <mesh
        ref={pupilRef}
        position={[0, 0, 0.995]}
        geometry={new THREE.CircleGeometry(0.17, 40)}
        material={pupilMaterial}
      />
      
      {/* Ana ışık yansıması - büyük ve parlak */}
      <mesh position={[0.15, 0.18, 1.08]}>
        <circleGeometry args={[0.14, 24]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.95} />
      </mesh>

      {/* İkinci parlama - yumuşak halo */}
      <mesh position={[0.15, 0.18, 1.075]}>
        <circleGeometry args={[0.20, 24]} />
        <meshBasicMaterial color={0xccffff} transparent opacity={0.3} />
      </mesh>

      {/* Alt yansımalar - dengeli görünüm */}
      <mesh position={[-0.12, -0.12, 1.055]}>
        <circleGeometry args={[0.07, 20]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.6} />
      </mesh>

      <mesh position={[-0.12, -0.12, 1.05]}>
        <circleGeometry args={[0.10, 20]} />
        <meshBasicMaterial color={0xe0f8ff} transparent opacity={0.25} />
      </mesh>

      {/* Küçük parlama noktaları */}
      <mesh position={[0.08, -0.14, 1.045]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.5} />
      </mesh>

      <mesh position={[-0.18, 0.05, 1.045]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.4} />
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
