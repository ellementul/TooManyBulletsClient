const { Member } = require('@ellementul/united-events-environment')
const { getPlayerUuid } = require("../player")
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")

class Viewport extends Member {
  constructor() {
    super()

    this.renderer = new Renderer
    this.camera = this.renderer.stage

    this.camera
    //   .drag()
    //   .pinch()
      .wheel()
    //   .decelerate()

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.camera.setZoom(1)
    this.renderer.setBackground("background")

    this.onEvent(updateEvent, payload => this.update(payload))
  }

  update({ state: characters }) {
    const playerUuid = getPlayerUuid()
    characters.forEach(character => {
      if(character.playerUuid === playerUuid)
        this.updatePlayerCharacter(character)
    })
  }

  updatePlayerCharacter({ position, box }) {
    this.camera.moveCenter(
      Math.floor(position.x + box.width / 2), 
      Math.floor(position.y + box.height / 2)
    )
  }
  
}

module.exports = { Viewport }