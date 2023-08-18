const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")
const { BilinearAnimator } = require("../animators")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")

const HIDDEN = "Hidden"
const STAND = "Stay"
const KILLED = "Killed"

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
        this.updateState(sprite, character.state)
        this.updatePosition(sprite, character.position)
        newCharacters.set(character.uuid, sprite)
      }
    })

    for (const [uuid, _] of oldCharacters) {
      this.renderer.deleteSprite(uuid, DEFAULT_LAYER)
    }

    this.characters = newCharacters
  }

  createCharacter({ uuid, state, position, box: hitBox }) {

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
          name: "body",
          position: coordinate_body,
          texture: "default_body",
          isCentred: true
        },
        {
          name: "head",
          position: coordinate_head,
          texture: "default_head",
          isCentred: true
        },
      ],
      layerName: DEFAULT_LAYER
    })

    character.states = {
      [HIDDEN]: [],
      [STAND]: ["body", "head"]
    }

    this.updateState(character, state)
    this.updatePosition(character, position)

    return character
  }

  updatePosition(character, position) {
    character.position.x = Math.floor(position.x)
    character.position.y = Math.floor(position.y)
  }

  updateState(character, state) {
    if(character.currentState === state) return

    character.currentState = state

    for (const spriteName in character.subSprites) {
      const sprite = character.subSprites[spriteName]
      const currentStateOfSprites = character.states[character.currentState]

      if(currentStateOfSprites.includes(spriteName))
        sprite.visible = true
      else
        sprite.visible = false
    }
  }
}

module.exports = { Characters }