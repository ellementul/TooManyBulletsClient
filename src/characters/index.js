const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")
const { LinearAnimator } = require("../animators")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-characters")
const shottingDirectChangeEvent = require("../events/shotting-direct-change")

const HIDDEN = "Hidden"
const STAND = "Stay"
const KILLED = "Killed"
const FALLING = "Falling"

const DEFAULT_LAYER = "characters"

const gunShift = {
  x: -25,
  y: 25
}

class Characters extends Member {
  constructor() {
    super()

    this.renderer = new Renderer
    this.characters = new Map

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.onEvent(shottingDirectChangeEvent, payload => this.rotation(payload), -1)
    this.onEvent(updateEvent, payload => this.update(payload), -1)
  }

  rotation({ playerUuid, state: direct }) {
    this.characters.forEach(character => {
      if(character.playerUuid === playerUuid)
        this.rotateGun(character, direct)
    })
  }

  rotateGun(character, direct) {
    const gun = character.subSprites["gun"]
    const radians = Math.atan2(direct.y, Math.abs(direct.x)) * Math.sign(direct.x)

    gun.rotation = radians 

    if(Math.abs(direct.x) === 0) return

    if(Math.sign(direct.x) !== Math.sign(gun.scale.x)) {
      gun.position.x += 2 * gunShift.x * Math.sign(direct.x)
    }

    gun.scale.x = Math.abs(gun.scale.x ) * Math.sign(direct.x)

    
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

  createCharacter({ uuid, playerUuid, state, position }) {

    const coordinate_head = {
      x: 0,
      y: -112
    }
    const coordinate_body = {
      x: 0,
      y: 52
    }
    const coordinate_spawn_effects = {
      x: 0,
      y: 0
    }

    const coordinatesSquart = {
      x: 0,
      y: 0
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
        {
          name: "gun",
          position: gunShift,
          texture: "gun",
          isCentred: true
        },
        {
          name: "squart",
          position: coordinatesSquart,
          texture: "squart",
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
      [STAND]: ["body", "head", "gun"],
      [KILLED]: [],
      [FALLING]: []
    }

    this.updateState(character, state)
    this.updatePosition(character, position)

    character.playerUuid = playerUuid

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
      this.spawnAnimation(character)

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
}

module.exports = { Characters }