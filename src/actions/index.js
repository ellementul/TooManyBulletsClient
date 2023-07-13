const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")
const { getPlayerUuid } = require("../player")

const runEvent = require("../events/ready-resources")
const movingEvent = require("../events/moving-direct")
const shotEvent = require("../events/shot-action")

const TOP = "Top"
const RIGHT = "Right"
const BOTTOM = "Bottom"
const LEFT = "Left"
const DIRECTS = {
  [TOP]: { x: 0, y: -1 }, 
  [RIGHT]: { x: 1, y: 0 }, 
  [BOTTOM]: { x: 0, y: 1 }, 
  [LEFT]: { x: -1, y: 0 }
}

const CURRENT_DIRECTS = {}

class Actions extends Member {
  constructor() {
    super()
    this.onEvent(runEvent, () => this.run())

    this.renderer = new Renderer

    this.actions = {
      "w": ["moveAction", TOP],
      "d": ["moveAction", RIGHT],
      "s": ["moveAction", BOTTOM],
      "a": ["moveAction", LEFT],
      " ": ["shotAction"],
    }

    this._movingDirect = { x: 0, y: 0 }
    this._shotDirect = { x: 1, y: 0}
  }

  run() {
    this.renderer.stage.on('mousemove', (event) => {
      this._shotDirect = this.renderer.toDirectFromCenter(event.global)
    })

    document.addEventListener("keydown", event => {
      if(this.actions[event.key]) {
        const [method, ...args] = this.actions[event.key]
        this[method](true, ...args)
      }
        
    })

    document.addEventListener("keyup", event => {
      if(this.actions[event.key]) {
        const [method, ...args] = this.actions[event.key]
        this[method](false, ...args)
      }
        
    })
  }

  moveAction(isDown, direct) {
    if(isDown)
      CURRENT_DIRECTS[direct] = DIRECTS[direct]
    else
      delete CURRENT_DIRECTS[direct]
    
    this.calculateMovingDirect(CURRENT_DIRECTS)
  }

  shotAction(isDown) {
    if(isDown)
      this.send(shotEvent, {
        state: {
          playerUuid: getPlayerUuid(),
          direct: this._shotDirect
        }
      })
  }

  calculateMovingDirect(CURRENT_DIRECTS) {
    const full_direct = { x: 0, y: 0 }
    for (const key in CURRENT_DIRECTS) {
      const one_direct = CURRENT_DIRECTS[key]

      full_direct.x += one_direct.x
      full_direct.y += one_direct.y
    }

    this.setMovingDirect(full_direct)
  }

  setMovingDirect(direct) {
    if(this._movingDirect.x === direct.x && this._movingDirect.y === direct.y)
      return

    this._movingDirect = direct

    this.send(movingEvent, {
      state: {
        playerUuid: getPlayerUuid(),
        direct: this._movingDirect
      }
    })
  }
}

module.exports = { Actions }