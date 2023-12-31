const { Member, events: { time } } = require('@ellementul/united-events-environment')
const joysticksManager = require("nipplejs")
const { Renderer } = require("../renderer")
const { getPlayerUuid } = require("../player")

const runEvent = require("../events/ready-resources")
const movingEvent = require("../events/moving-direct-change")
const shottingDirectChangeEvent = require("../events/shotting-direct-change")
const shotEvent = require("../events/shot-action")


class Actions extends Member {
  constructor() {
    super()
    this.onEvent(runEvent, () => this.run())

    this.renderer = new Renderer


    this.directs = new Directs
    this.actions = {
      "KeyW": ["moveAction", this.directs.TOP],
      "KeyD": ["moveAction", this.directs.RIGHT],
      "KeyS": ["moveAction", this.directs.BOTTOM],
      "KeyA": ["moveAction", this.directs.LEFT],
      "Space": ["shotAction"],
    }

    this._movingDirect = { x: 0, y: 0 }
    this._shotDirect = { x: 1, y: 0}
    this._isShotting = false
  }

  run() {
    document.body.addEventListener('mousemove', event => {
      const direct = this.renderer.toDirectFromCenter({ x: event.offsetX, y: event.offsetY})
      this.rotateAction(direct)
    })

    document.body.addEventListener('mousedown', () => {
      this.shotAction(true)
    })

    document.body.addEventListener('mouseup', () => {
      this.shotAction(false)
    })

    document.addEventListener("keydown", event => {
      if(this.actions[event.code]) {
        const [method, ...args] = this.actions[event.code]
        this[method](true, ...args)
      }
    })

    document.addEventListener("keyup", event => {
      if(this.actions[event.code]) {
        const [method, ...args] = this.actions[event.code]
        this[method](false, ...args)
      }
    })

    document.onvisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        this.clearStates()
      }
    }

    if(this.renderer.isMobile)
      this.addJoystick()

    this.onEvent(time, () => this.tick(), -1)
  }

  movingZone() {
    const movingZone = document.createElement('div')
    movingZone.id = "movingZone"
    movingZone.style.width = '50vw'
    movingZone.style.height = '50vh'
    movingZone.style.position = 'absolute'
    movingZone.style.left = 0
    movingZone.style.bottom = 0

    document.body.appendChild(movingZone)

    return movingZone
  }

  shottingZone() {
    const shottingZone = document.createElement('div')
    shottingZone.id = "movingZone"
    shottingZone.style.width = '50vw'
    shottingZone.style.height = '50vh'
    shottingZone.style.position = 'absolute'
    shottingZone.style.right = 0
    shottingZone.style.bottom = 0

    document.body.appendChild(shottingZone)

    return shottingZone
  }

  addJoystick() {
    const movingJoystick = joysticksManager.create({
      zone: this.movingZone(), 
      mode: "static",
      position: { bottom: "50%", left: "50%" },
      size: 400,
      threshold: 0
    })[0]

    movingJoystick.on('move', (_, { vector }) => {
      vector.y *= -1
      this.setMovingDirect(this.directs.precision(vector))
    })

    movingJoystick.on('end', () => {
      this.setMovingDirect({ x: 0, y: 0 })
    })

    const shottingJoystick = joysticksManager.create({
      zone: this.shottingZone(),
      mode: "static",
      position: { bottom: "50%", right: "50%" },
      size: 400,
      threshold: 0
    })[0]

    shottingJoystick.on('start', () => {
      this.shotAction(true)
    })

    shottingJoystick.on('move', (_, { vector }) => {
      vector.y *= -1
      this.rotateAction(vector)
    })

    shottingJoystick.on('end', () => {
      this.shotAction(false)
    })
  }

  moveAction(isDown, direct) {
    if(isDown)
      this.directs.addDirect(direct)
    else
      this.directs.delDirect(direct)
    
    const vecDirect = this.directs.precision(this.directs.calculateMovingDirect())  
    this.setMovingDirect(vecDirect)
  }

  rotateAction(direct) {
    const vecDirect = this.directs.precision(this.directs.normalize(direct))
    this.setShottingDirect(vecDirect)
  }

  shotAction(isDown) {
    this.setShotting(isDown)
  }

  setMovingDirect(direct) {
    if(this._movingDirect.x === direct.x && this._movingDirect.y === direct.y)
      return

    this._movingDirect = direct

    this.send(movingEvent, {
      playerUuid: getPlayerUuid(),
      state: { ...this._movingDirect }
    })
  }

  setShottingDirect(direct) {
    if(this._shotDirect.x === direct.x && this._shotDirect.y === direct.y)
      return

    this._shotDirect = direct

    this.send(shottingDirectChangeEvent, {
      playerUuid: getPlayerUuid(),
      state: { ...this._shotDirect }
    })
  }

  setShotting(isShotiing) {
    if(isShotiing === this._isShotting)
      return

    this._isShotting = isShotiing

    this.send(shotEvent, {
      playerUuid: getPlayerUuid(),
      state: this._isShotting
    })
  }

  clearStates() {
    this._movingDirect = { x: 0, y: 0 }
    this._shotDirect = { x: 1, y: 0}
    this._isShotting = false
  }

  tick() {
    this.send(movingEvent, {
      playerUuid: getPlayerUuid(),
      state: { ...this._movingDirect }
    })

    this.send(shottingDirectChangeEvent, {
      playerUuid: getPlayerUuid(),
      state: { ...this._shotDirect }
    })

    this.send(shotEvent, {
      playerUuid: getPlayerUuid(),
      state: this._isShotting
    })
  }
}

class Directs {
  constructor(){
    this.TOP = "Top"
    this.RIGHT = "Right"
    this.BOTTOM = "Bottom"
    this.LEFT = "Left"
    this.DIRECTS = {
      [this.TOP]: { x: 0, y: -1 }, 
      [this.RIGHT]: { x: 1, y: 0 }, 
      [this.BOTTOM]: { x: 0, y: 1 }, 
      [this.LEFT]: { x: -1, y: 0 }
    }

    this.currentDirects = {}
  }

  addDirect(direct) {
    this.currentDirects[direct] = this.DIRECTS[direct]
  }

  delDirect(direct) {
    delete this.currentDirects[direct]
  }

  calculateMovingDirect() {
    const full_direct = { x: 0, y: 0 }
    for (const key in this.currentDirects) {
      const one_direct = this.currentDirects[key]
  
      full_direct.x += one_direct.x
      full_direct.y += one_direct.y
    }
  
    return full_direct
  }

  precision({x,y}) {
    return { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 }
  }

  normalize({x, y}) {
    if(x === 0 || y === 0)
      return {
        x: Math.sign(x), 
        y: Math.sign(y)
      }

    const length = Math.sqrt(x*x + y*y)
    return {
      x: x / length,
      y: y / length,
    }
  }
}

module.exports = { Actions }