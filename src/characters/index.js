const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")

const DEFAULT_LAYER = "characters"
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
    const oldCharacters = this.characters
    const newCharacters = new Map

    characters.forEach(character => {
      if(!this.characters.has(character.uuid)) {
        newCharacters.set(character.uuid, this.createCharacter(character))
      }
      else {
        const sprite = this.characters.get(character.uuid)
        oldCharacters.delete(character.uuid)
        this.updateCharacter(sprite, character)
        newCharacters.set(character.uuid, sprite)
      }
    })

    for (const [uuid, _] of oldCharacters) {
      this.renderer.deleteSprite(uuid, DEFAULT_LAYER)
    }

    this.characters = newCharacters
  }

  createCharacter({ uuid, position, box: hitBox }) {

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
      uuid,
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
      layerName: DEFAULT_LAYER
    })

    character.position.x = position.x
    character.position.y = position.y

    return character
  }

  updateCharacter(character, { position }) {
    character.position.x = position.x
    character.position.y = position.y
  }
}

module.exports = { Characters }