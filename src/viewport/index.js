const { Member } = require('@ellementul/united-events-environment')
const { getPlayerUuid } = require("../player")
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")

class Viewport extends Member {
  constructor() {
    super()

    this.camera = (new Renderer).stage

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.camera.setZoom(0.3)

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
      position.x + box.width / 2, 
      position.y + box.height / 2
    )
  }
  
}

module.exports = { Viewport }