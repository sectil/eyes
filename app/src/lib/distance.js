// Ön kamera + MediaPipe Face Landmarker ile göz–ekran mesafesi.
// Yöntem: iris çapı (piksel) mesafeyle ters orantılıdır (iğne deliği kamera modeli).
// Web'de kamera odak uzaklığı bilinmediği için kullanıcı bir kez 40 cm'de
// kalibrasyon yapar: mesafe = 400 mm × irisPxAt40 / irisPx.
// Kişiye özel kalibrasyon, nüfus ortalaması iris çapı (11.7 mm) varsayımını gereksiz kılar.

export const REFERENCE_MM = 400

// Model kullanıcının cihazında çalışma anında indirilir (ilk açılışta internet gerekir).
export const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
// WASM dosyaları build sırasında node_modules'tan public/mediapipe-wasm'a kopyalanır.
export const WASM_BASE = './mediapipe-wasm'

// Bağlantı listesinden (Connection[] = {start,end}) benzersiz nokta indeksleri
export function indicesFromConnections(connections) {
  const set = new Set()
  for (const c of connections) {
    set.add(c.start)
    set.add(c.end)
  }
  return [...set]
}

// Bir irisin yatay çapı (piksel). landmarks: normalize {x,y} dizisi.
export function irisDiameterPx(landmarks, indices, videoW, videoH) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const i of indices) {
    const p = landmarks[i]
    if (!p) return null
    const x = p.x * videoW
    const y = p.y * videoH
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  // Yatay çap; kapak dikey çapı kırpabileceği için yatay tercih edilir
  return maxX - minX
}

export function distanceMm(irisPx, irisPxAt40) {
  if (!irisPx || !irisPxAt40) return null
  return (REFERENCE_MM * irisPxAt40) / irisPx
}

// Kayan medyan: tek karelik gürültüyü bastırır
export function createMedian(size = 9) {
  const buf = []
  return {
    push(v) {
      if (v == null || !Number.isFinite(v)) return this.value()
      buf.push(v)
      if (buf.length > size) buf.shift()
      return this.value()
    },
    value() {
      if (!buf.length) return null
      const s = [...buf].sort((a, b) => a - b)
      const m = s.length >> 1
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
    },
    reset() {
      buf.length = 0
    },
  }
}

// Mesafe testte kabul aralığında mı? (±%10 → logMAR hatası ≤ ~0.04)
export function distanceStatus(mm, target = REFERENCE_MM, tolerance = 0.1) {
  if (mm == null) return 'unknown'
  if (mm < target * (1 - tolerance)) return 'too-close'
  if (mm > target * (1 + tolerance)) return 'too-far'
  return 'ok'
}

// --- Tarayıcıya bağlı kısım (testlerde çağrılmaz) ---

let landmarkerPromise = null

export function loadLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)
      const landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
      })
      return {
        landmarker,
        leftIris: indicesFromConnections(FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS),
        rightIris: indicesFromConnections(FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS),
        leftEye: FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        rightEye: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      }
    })()
    landmarkerPromise.catch(() => {
      landmarkerPromise = null
    })
  }
  return landmarkerPromise
}

export async function startCamera(video) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  })
  video.srcObject = stream
  video.playsInline = true
  video.muted = true
  await video.play()
  return () => stream.getTracks().forEach((t) => t.stop())
}

// Tek kare ölçüm: iki irisin ortalama çapı (px) ve yüz noktaları
export function measureFrame(ctx, video, timestampMs) {
  const res = ctx.landmarker.detectForVideo(video, timestampMs)
  const lm = res.faceLandmarks?.[0]
  if (!lm) return { face: false }
  const w = video.videoWidth
  const h = video.videoHeight
  const l = irisDiameterPx(lm, ctx.leftIris, w, h)
  const r = irisDiameterPx(lm, ctx.rightIris, w, h)
  const vals = [l, r].filter((v) => v && v > 0)
  if (!vals.length) return { face: true, irisPx: null, landmarks: lm }
  return {
    face: true,
    irisPx: vals.reduce((a, b) => a + b, 0) / vals.length,
    landmarks: lm,
    videoW: w,
    videoH: h,
  }
}
