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

    // Hash function for noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // 2D Noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Fractal Brownian Motion
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for(int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 center = vec2(0.5);
      vec2 dir = vUv - center;
      float dist = length(dir);
      float angle = atan(dir.y, dir.x);

      // Ultra-detailed radial fiber pattern (80+ lines)
      float fibers = 0.0;
      for(float i = 0.0; i < 80.0; i += 1.0) {
        float lineAngle = (i / 80.0) * 6.283185;
        float angleDiff = abs(angle - lineAngle);
        angleDiff = min(angleDiff, 6.283185 - angleDiff);

        float lineWidth = 0.005 + sin(i * 0.7) * 0.003;
        float lineStrength = smoothstep(lineWidth, 0.0, angleDiff);
        lineStrength *= (0.5 + sin(i * 0.5) * 0.3);
        lineStrength *= (1.0 - dist * 0.3);

        fibers += lineStrength * 0.15;
      }

      // Organic noise texture (150+ points simulation)
      float organicNoise = fbm(vUv * 50.0 + uTime * 0.01);
      float pointNoise = 0.0;
      for(float i = 0.0; i < 30.0; i++) {
        vec2 randomPoint = vec2(
          hash(vec2(i * 0.1, 0.0)),
          hash(vec2(i * 0.1, 1.0))
        );
        float pointDist = length(vUv - randomPoint);
        pointNoise += smoothstep(0.05, 0.0, pointDist) * 0.1;
      }

      // Fuchs Crypts (diamond-shaped iris openings)
      float crypts = 0.0;
      for(float i = 0.0; i < 12.0; i++) {
        float cryptAngle = (i / 12.0) * 6.283185 + sin(i) * 0.2;
        float cryptDist = 0.35 + sin(i * 2.0) * 0.1;
        vec2 cryptPos = center + vec2(cos(cryptAngle), sin(cryptAngle)) * cryptDist;
        float d = length(vUv - cryptPos);
        crypts += smoothstep(0.03, 0.01, d) * 0.2;
      }

      // Multi-layered color gradient (11 stops)
      vec3 color1 = vec3(0.83, 0.72, 0.44);  // #D4B870 Gold
      vec3 color2 = vec3(0.56, 0.67, 0.47);  // #8FAA78 Light green
      vec3 color3 = vec3(0.32, 0.53, 0.49);  // #52887C Teal
      vec3 color4 = vec3(0.18, 0.46, 0.44);  // #2E6663 Dark teal
      vec3 color5 = vec3(0.07, 0.27, 0.25);  // #123832 Very dark
      vec3 color6 = vec3(0.04, 0.17, 0.16);  // #0A2B28 Almost black

      vec3 irisColor;
      if (dist < 0.15) {
        irisColor = mix(color1, color2, dist / 0.15);
      } else if (dist < 0.35) {
        irisColor = mix(color2, color3, (dist - 0.15) / 0.2);
      } else if (dist < 0.55) {
        irisColor = mix(color3, color4, (dist - 0.35) / 0.2);
      } else if (dist < 0.75) {
        irisColor = mix(color4, color5, (dist - 0.55) / 0.2);
      } else {
        irisColor = mix(color5, color6, (dist - 0.75) / 0.25);
      }

      // Apply fiber pattern
      irisColor = mix(irisColor, irisColor * 0.7, fibers);

      // Apply organic noise
      irisColor = mix(irisColor, irisColor * 1.2, organicNoise * 0.3);
      irisColor = mix(irisColor, irisColor * 0.8, pointNoise);

      // Apply crypts (darker spots)
      irisColor = mix(irisColor, irisColor * 0.6, crypts);

      // Concentric circles (10 rings for depth)
      for(float i = 0.4; i < 0.97; i += 0.06) {
        float ringDist = abs(dist - i);
        float ring = smoothstep(0.008, 0.0, ringDist) * 0.15;
        irisColor = mix(irisColor, irisColor * 0.85, ring);
      }

      // Collarette (wavy pattern around pupil)
      float collarette = abs(dist - 0.32);
      collarette = smoothstep(0.015, 0.0, collarette);
      float wavyPattern = sin(angle * 20.0) * 0.5 + 0.5;
      collarette *= wavyPattern;
      irisColor = mix(irisColor, irisColor * 0.7, collarette * 0.3);

      // Strong limbal ring (youthful, healthy eye)
      float limbalInner = smoothstep(0.42, 0.48, dist);
      float limbalOuter = 1.0 - smoothstep(0.48, 0.52, dist);
      float limbal = limbalInner * limbalOuter;
      irisColor = mix(irisColor, vec3(0.06, 0.14, 0.18), limbal * 0.8);

      // 3D depth overlay
      float depth = pow(1.0 - dist, 2.0);
      irisColor += vec3(1.0) * depth * 0.15;

      // Edge darkening
      float edge = smoothstep(0.5, 0.52, dist);
      irisColor = mix(irisColor, irisColor * 0.5, edge);

      // Fresnel effect (wetness)
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      irisColor += vec3(1.0) * fresnel * 0.2;

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
  
  // Sclera materyal - Gerçekçi göz beyazı (hafif krem tonu)
  const scleraMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xFBF8F3,  // Hafif krem beyaz
      roughness: 0.5,
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

  // Kan damarları geometrisi
  const bloodVessels = useMemo(() => {
    const vessels = []
    const veinMaterial = new THREE.LineBasicMaterial({
      color: 0xB43C3C,
      opacity: 0.15,
      transparent: true,
      linewidth: 1
    })

    // 8 kan damarı
    const veins = [
      { start: [-0.7, -0.2, 0.99], end: [-0.4, -0.1, 0.99] },
      { start: [-0.65, -0.15, 0.99], end: [-0.45, -0.08, 0.99] },
      { start: [0.7, 0.2, 0.99], end: [0.4, 0.1, 0.99] },
      { start: [0.65, 0.15, 0.99], end: [0.45, 0.08, 0.99] },
      { start: [-0.6, 0.25, 0.99], end: [-0.35, 0.15, 0.99] },
      { start: [0.6, -0.25, 0.99], end: [0.35, -0.15, 0.99] },
      { start: [-0.55, 0.12, 0.99], end: [-0.38, 0.08, 0.99] },
      { start: [0.55, -0.12, 0.99], end: [0.38, -0.08, 0.99] },
    ]

    veins.forEach(vein => {
      const points = [
        new THREE.Vector3(...vein.start),
        new THREE.Vector3(...vein.end)
      ]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      vessels.push({ geometry, material: veinMaterial })
    })

    return vessels
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

      {/* Kan damarları */}
      {bloodVessels.map((vessel, i) => (
        <line key={`vein-${i}`} geometry={vessel.geometry} material={vessel.material} />
      ))}

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
