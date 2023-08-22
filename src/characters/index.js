const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")
const { LinearAnimator } = require("../animators")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")

const HIDDEN = "Hidden"
const STAND = "Stay"
const KILLED = "Killed"
const FALLING = "Falling"

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

  update({ state: charactersData }) {
    const oldCharacters = this.characters
    const newCharacters = new Map

    charactersData.forEach(characterData => {
      if(!this.characters.has(characterData.uuid)) {
        newCharacters.set(characterData.uuid, this.createCharacter(characterData))
      }
      else {
        const character = this.characters.get(characterData.uuid)
        oldCharacters.delete(characterData.uuid)
        this.updateCharacter(character, characterData)
        newCharacters.set(characterData.uuid, character)
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
    const coordinate_spawn_effects = {
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
        {
          name: "spawn_effects",
          position: coordinate_spawn_effects,
          texture: "teleport",
          isCentred: true
        },
      ],
      layerName: DEFAULT_LAYER
    })

    const default_state = "INIT"
    character.currentState = default_state
    character.states = {
      [default_state]: [],
      [HIDDEN]: [],
      [STAND]: ["body", "head"],
      [KILLED]: [],
      [FALLING]: ["body", "head"]
    }

    this.updateState(character, state)
    this.updatePosition(character, position)

    return character
  }

  updateCharacter(character, { state, position }){
    this.updateState(character, state)
    if(state === STAND) this.updatePosition(character, position)
  }

  updatePosition(character, position) {
    character.position.x = Math.floor(position.x)
    character.position.y = Math.floor(position.y)
  }

  updateState(character, state) {
    if(character.currentState === state) return

    if(!character.states[state])
      throw new TypeError(`Unknown animation state: ${state}`)

    const prevState = character.currentState
    character.currentState = state

    for (const spriteName in character.subSprites) {
      const sprite = character.subSprites[spriteName]
      const currentStateOfSprites = character.states[character.currentState]

      if(currentStateOfSprites.includes(spriteName))
        sprite.visible = true
      else
        sprite.visible = false
    }

    if(prevState === HIDDEN && state === STAND)
      this.spawnAnimation(character)

    if(prevState === STAND && state === FALLING)
      this.fallingAnimation(character)

    if(prevState === STAND && state === KILLED)
      this.spawnAnimation(character)
  }

  spawnAnimation(character) {
    const animator = new LinearAnimator({ reverse: true, time: 700 })
    const spawn_effects = character.subSprites.spawn_effects

    spawn_effects.visible = true
    animator.onUpdateState(value => {
      spawn_effects.scale.y = Math.sqrt(value)
    })
    animator.onComplete(() => {
      spawn_effects.visible = false
      spawn_effects.scale.y = 1
    })
    animator.start()
  }

  fallingAnimation(character) {
    const animator = new LinearAnimator({ time: 2000, beginValue: 10, endValue: 100 })

    animator.onUpdateState(value => {
      character.position.y += value
    })
    animator.onComplete(() => {})
    animator.start()
  }
}

module.exports = { Characters }