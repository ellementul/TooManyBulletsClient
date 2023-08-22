const { Ticker } = require("pixi.js")

class Animator {
  constructor({ time = 1000, reverse = false } = {}) {
    this.ticker = Ticker.shared
    
    this.reverse = reverse
    this.endTime = time
    this.coffScale = 1 / time 

    this.updateState = () => { throw new TypeError("You need to setup updating callback via onUpdateState method!") }
    this.complete = () => {}
  }

  onUpdateState(cb) {
    if(typeof cb !== "function") throw new TypeError

    this.updateState = cb
  }

  onComplete(cb) {
    if(typeof cb !== "function") throw new TypeError

    this.complete = cb
  }

  start() {
    this.initTime = Date.now()

    this.ticker.add(this.tick, this)
  }

  calcArg(time) {
    if(!this.reverse)
      return time * this.coffScale
    else
      return 1 - (time * this.coffScale)
  }

  calcValue(arg) {
    return arg
  }

  tick() {
    const time = Date.now() - this.initTime
    const arg = this.calcArg(time)

    if(time >= this.endTime) {
      this.end(this.calcValue(arg))
      return
    }

    this.updateState(this.calcValue(arg))
  }

  end() {
    this.ticker.remove(this.tick, this)
    this.complete()
  }
}

class LinearAnimator extends Animator {
  constructor({ time, reverse, beginValue = 0, endValue = 1 } = {}) {
    super({ time, reverse })
    
    this.beginValue = beginValue
    this.valueRange = endValue - beginValue
  }

  calcValue(arg) {
    return this.beginValue + this.valueRange * arg
  }
}

class StepsAnimator {
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

class BilinearStepsAnimator extends StepsAnimator {
  constructor({ minStep = 50, steps = 10, time = 3000, reverse = false } = {}) {
    super()

    this.minStep = minStep
    this.steps = steps
    this.endTime = time
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

module.exports = { BilinearStepsAnimator, LinearAnimator }