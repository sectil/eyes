class EyeSmoothing {
  constructor(alpha = 0.4) {
    this.alpha = alpha
    this.smoothedX = null
    this.smoothedY = null
  }
  
  smooth(x, y) {
    if (this.smoothedX === null) {
      this.smoothedX = x
      this.smoothedY = y
    } else {
      this.smoothedX = this.alpha * x + (1 - this.alpha) * this.smoothedX
      this.smoothedY = this.alpha * y + (1 - this.alpha) * this.smoothedY
    }
    return { x: this.smoothedX, y: this.smoothedY }
  }
}

export default EyeSmoothing
