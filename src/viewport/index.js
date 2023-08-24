const { Member } = require('@ellementul/united-events-environment')
const { getPlayerUuid } = require("../player")
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")
const pongEvent = require("../events/pong-players")

class Viewport extends Member {
  constructor() {
    super()

    this.renderer = new Renderer
    this.camera = this.renderer.stage

    this.camera
    //   .drag()
    //   .pinch()
    .wheel()
    .clampZoom({ minScale: 0.5, maxScale: 1 })
      
    //   .decelerate()

    // this.renderer.events.cursorStyles["default"] = (mode) => {
    //   cursor.texture = this.renderer.store.getTexture("default_cursor")
    // }
    
    this.renderer.events.cursorStyles["default"] = "url('./assets/cursor.svg'), auto"
    
    // this.renderer.canvasElement.requestFullscreen().catch(alert)

    // if(this.renderer.isMobile)
    //   screen.orientation.lock("landscape-primary").then(alert).catch(alert)

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.camera.setZoom(1, true)
    this.renderer.setBackground("background")

    this.onEvent(updateEvent, payload => this.update(payload))
    this.onEvent(pongEvent, payload => this.showPong(payload))
  }

  showPong({ playerUuid, deltaTime, maxDeltaTime }) {
    if(getPlayerUuid() === playerUuid)
      this.renderer.updatePing(deltaTime, maxDeltaTime)
  }

  update({ state: characters }) {
    const playerUuid = getPlayerUuid()
    characters.forEach(character => {
      if(character.playerUuid === playerUuid)
        this.updatePlayerCharacter(character)
    })
  }

  updatePlayerCharacter({ position }) {
    this.camera.moveCenter(
      Math.floor(position.x), 
      Math.floor(position.y)
    )
  }
  
}

module.exports = { Viewport }