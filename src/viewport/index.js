const { Member } = require('@ellementul/united-events-environment')
const { getPlayerUuid } = require("../player")
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")

const updateEvent = require("../events/update-characters")

const updatePlayerCount = require("../events/update-players-count")
const updateWallsCount = require("../events/update-walls-count")

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

    this.gameStats = new GameStats

    this.onEvent(updateEvent, payload => this.update(payload))

    this.onEvent(updatePlayerCount, payload => this.updateStates(payload))
    this.onEvent(updateWallsCount, payload => this.updateStates(payload))

    this.onEvent(pongEvent, payload => this.showPong(payload))
  }

  showPong({ playerUuid, deltaTime, maxDeltaTime }) {
    if(getPlayerUuid() === playerUuid)
      this.renderer.updatePing(deltaTime, maxDeltaTime)
  }

  updateStates({ entity: stateName, state: stateValue }) {
    this.gameStats.updateState(stateName, stateValue)
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


class GameStats {
  constructor() {
    const widget = document.createElement('div')
    widget.style.width = '15vw'
    widget.style.position = 'absolute'
    widget.style.left = 0
    widget.style.top = "20%"
    widget.style.padding = "10px"

    document.body.appendChild(widget)

    this.widget = widget

    this.widget.style.fontSize = "x-large"
    this.widget.style.backgroundColor = "white"

    this.states = {}
  }

  updateState(stateName, stateValue) {
    this.states[stateName] = stateValue

    this.renderStates()
  }

  renderStates() {
    const list = []

    for (const stateName in this.states) {
      list.push(`<p>${stateName}: ${this.states[stateName]}`)
    }

    this.widget.innerHTML = list.join("\n")
  }
}

module.exports = { Viewport }