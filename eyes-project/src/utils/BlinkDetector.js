class BlinkDetector {
  constructor() {
    this.EAR_THRESHOLD = 0.3
    this.CONSEC_FRAMES = 3
    this.frameCounter = 0
    this.blinkCount = 0
  }
  
  calculateEAR(eyeLandmarks) {
    const A = this.distance(eyeLandmarks[1], eyeLandmarks[5])
    const B = this.distance(eyeLandmarks[2], eyeLandmarks[4])
    const C = this.distance(eyeLandmarks[0], eyeLandmarks[3])
    return (A + B) / (2.0 * C)
  }
  
  distance(p1, p2) {
    return Math.sqrt(
      Math.pow(p2[0] - p1[0], 2) + 
      Math.pow(p2[1] - p1[1], 2)
    )
  }
  
  updateBlink(leftEye, rightEye) {
    const leftEAR = this.calculateEAR(leftEye)
    const rightEAR = this.calculateEAR(rightEye)
    const avgEAR = (leftEAR + rightEAR) / 2.0
    
    let blinkDetected = false
    
    if (avgEAR < this.EAR_THRESHOLD) {
      this.frameCounter++
    } else {
      if (this.frameCounter >= this.CONSEC_FRAMES) {
        this.blinkCount++
        blinkDetected = true
      }
      this.frameCounter = 0
    }
    
    return { blinkDetected, ear: avgEAR, totalBlinks: this.blinkCount }
  }
}

export default BlinkDetector
