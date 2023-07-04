const { Application, Texture, Sprite, Container } = require("pixi.js")
const { Viewport } = require("pixi-viewport")
const { Store } = require("../store")

const ERROR_TEXTURE = "error"
const DEFAULT_LAYER = "background"
const LAYERS = new Map([
  ["background", 0],
  ["walls", 1],
  ["characters", 2]
])

let single = null
class Renderer {
  constructor() {
    if(single)
      return single
    else
      single = this

    this.store = new Store

    const app = new Application({
      width: window.innerWidth,
      height: window.innerHeight
    })
    document.body.appendChild(app.view)

    this.stage = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,

      events: app.renderer.events
    })

    this.stage
      .drag()
      .pinch()
      .wheel()
      .decelerate()

    app.stage.addChild(this.stage)

    const layers = []
    for (const [name, index] of LAYERS) {
      while(index > layers.length - 1){
        const newLayer = new Container
        this.stage.addChild(newLayer)
        layers.push(newLayer)
      }
      LAYERS.set(name, layers[index])
    }
  }

  createSprite({ texture: textureName, frame, position, isCentred = false }) {
    if(!textureName)
      textureName = ERROR_TEXTURE

    const baseTexture = this.store.getTexture(textureName)
    const texture = frame ? new Texture(baseTexture, frame) : baseTexture

    const sprite = new Sprite(texture)
    sprite.position.x = position.x
    sprite.position.y = position.y

    if(isCentred) {
      sprite.pivot.x = sprite.width / 2
      sprite.pivot.y = sprite.height / 2
    }

    return sprite
  }

  addSprite ({ texture, frame, position, layerName }) {

    const sprite = this.createSprite({ texture, frame, position })

    LAYERS.get(layerName || DEFAULT_LAYER).addChild(sprite)

    return sprite
  }

  addSpritesAsOne({ sprites: newSprites, layerName }) {
    const container = new Container
    newSprites.map( newSprite => container.addChild(this.createSprite(newSprite)) )

    LAYERS.get(layerName || DEFAULT_LAYER).addChild(container)

    return container
  }

}

module.exports = { Renderer }