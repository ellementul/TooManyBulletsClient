const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")

class Characters extends Member {
  constructor() {
    super()

    this.renderer = new Renderer
    this.characters = new Map

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.onEvent(updateEvent, payload => this.update(payload))
  }

  update({ state: characters }) {
    characters.forEach(character => {
      if(!this.characters.has(character.uuid))
        this.createCharacter(character)
      else
        this.updateCharacter(character)
    });
  }

  createCharacter({ uuid, position, box: hitBox }) {
    console.log("Created character", uuid)

    const viewBox = { width: 256, height: 360 }
    const shiftPosition = { 
      x: (hitBox.width - viewBox.width) /2, 
      y: (hitBox.height - viewBox.height) /2
    }

    const coordinate_head = {
      x: 128 + shiftPosition.x,
      y: 64 + shiftPosition.y
    }
    const coordinate_body = {
      x: 128 + shiftPosition.x,
      y: 232 + shiftPosition.y
    }

    const character = this.renderer.addSpritesAsOne({
      sprites: [
        {
          position: coordinate_body,
          texture: "default_body",
          isCentred: true
        },
        {
          position: coordinate_head,
          texture: "default_head",
          isCentred: true
        },
      ],
      layerName: "characters"
    })

    character.position.x = position.x
    character.position.y = position.y

    this.characters.set(uuid, character)
  }

  updateCharacter({ uuid, position }) {
    const character = this.characters.get(uuid)

    character.position.x = position.x
    character.position.y = position.y
  }
}

module.exports = { Characters }