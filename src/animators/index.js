const { Ticker } = require("pixi.js")

class Animator {
  constructor() {
    this.ticker = Ticker.shared

    this.updateState = () => { throw new TypeError("You need to setup updating callback via onUpdateState method!") }
    this.complete = () => {}
  }

  setup() {}
  updateStep() {}
  ifUpdate() { return true }
  ifEnd() { return true }

  onUpdateState(cb) {
    if(typeof cb !== "function") throw new TypeError

    this.updateState = cb
  }

  onComplete(cb) {
    if(typeof cb !== "function") throw new TypeError

    this.complete = cb
  }

  start() {
    this.setup()

    this.ticker.add(this.tick, this)
  }

  tick(time) {
    if(this.ifEnd(time)) {
      this.end(time)
      return
    }

    if(this.ifUpdate(time))
      this.updateState(this.updateStep(time))
  }

  end() {
    this.ticker.remove(this.tick, this)
    this.complete()
  }
}

class BilinearAnimator extends Animator {
  constructor({ minStep = 50, steps = 10, endTime = 3000, reverse = false } = {}) {
    super()

    this.minStep = minStep
    this.steps = steps
    this.endTime = endTime
    this.reverse = reverse

    this.coffR = (this.endTime - this.minStep) / (this.steps * this.steps)
  }

  setup() {
    this.initTime = Date.now()

    if(this.reverse)
      this.currentStep = this.steps
    else
      this.currentStep = 0

    this.currentValue = this.minStep
  }

  updateStep() {
    this.currentValue += this.currentStep * this.coffR
    if(this.reverse)
      this.currentStep--
    else
      this.currentStep++
    this.currentValue += this.currentStep * this.coffR
    
    
    return this.currentValue
  }

  ifUpdate() {
    return (Date.now() - this.initTime) > this.currentValue
  }

  ifEnd() {
    return (Date.now() - this.initTime) > this.endTime
  }
}

module.exports = { BilinearAnimator }