const { Application, Texture, Sprite, Container, Ticker, UPDATE_PRIORITY } = require("pixi.js")
const { Viewport } = require("pixi-viewport")
const { PIXIHooks, StatsJSAdapter, Stats, Panel } = require('pixi-stats')
const { Store } = require("../store")

const isDev = true

const ERROR_TEXTURE = "error"
const DEFAULT_LAYER = "ground"
const LAYERS = new Map([
  ["ground", 0],
  ["walls", 1],
  ["characters", 2],
  ["foreground", 3]
])

let single = null
class Renderer {
  constructor() {
    if(single)
      return single
    else
      single = this

    this.store = new Store

    const app = new Application({ resizeTo: window })
    document.body.appendChild(app.view)

    this.events = app.renderer.events

    if(isDev)
      this.addStats(app)

    this.stage = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,

      events: app.renderer.events
    })

    this.background = new Container
    app.stage.addChild(this.background)
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

    this.sprites = new Map
  }

  vectorLength({x, y}) {
    return Math.sqrt(x*x + y*y)
  }

  vectorNormalize({x, y}) {
    const length = this.vectorLength({x, y})
    return {
      x: x / length,
      y: y / length,
    }
  }

  toCoordinateFromSreenCeneter({ x, y }) {
    const position = this.stage.toWorld(x, y)
    const center = this.stage.center

    return {
      x: position.x - center.x,
      y: position.y - center.y,
    }
  }

  toDirectFromCenter(pointOnScreen) {
    const pointOnScreenFromCeneter = this.toCoordinateFromSreenCeneter(pointOnScreen)

    return this.vectorNormalize(pointOnScreenFromCeneter)
  }

  addStats(app) {
    const stats = new Stats();
    const pixiHooks = new PIXIHooks(app)
    const adapter = new StatsJSAdapter(pixiHooks, stats)

    this.pingPanel = new Panel("Ping", "blue", "green")
    stats.addPanel(this.pingPanel)
  
    document.body.appendChild(adapter.stats.domElement)

    const ticker = Ticker.shared
    ticker.add(stats.update, stats, UPDATE_PRIORITY.UTILITY)
  }

  updatePing(ping, maxPing) {
    if(this.pingPanel)
      this.pingPanel.update(ping, maxPing)
  }

  setBackground(texture) {
    const baseTexture = this.store.getTexture(texture)
    const background = new Sprite(baseTexture)
    background.position.x = 0
    background.position.y = 0
    this.background.addChild(background)
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

  addSprite ({ uuid, texture, frame, position, layerName }) {

    const sprite = this.createSprite({ texture, frame, position })

    LAYERS.get(layerName || DEFAULT_LAYER).addChild(sprite)

    this.sprites.set(uuid, sprite)
    return sprite
  }

  deleteSprite(uuid, layerName) {
    const sprite = this.sprites.get(uuid)
    LAYERS.get(layerName).removeChild(sprite)
    this.sprites.delete(uuid)
  }

  addSpritesAsOne({ uuid, sprites: newSprites, layerName }) {
    const container = new Container
    container.subSprites = {}

    newSprites.map( newSprite => {
      const sprite = this.createSprite(newSprite)
      container.addChild(sprite)
      sprite.position = container.toGlobal(newSprite.position)
      container.subSprites[newSprite.name] = sprite
    })

    LAYERS.get(layerName || DEFAULT_LAYER).addChild(container)

    this.sprites.set(uuid, container)

    return container
  }

}

module.exports = { Renderer }