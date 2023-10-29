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

window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

let single = null
class Renderer {
  constructor() {
    if(single)
      return single
    else
      single = this

    this.store = new Store

    this.isMobile = window.mobileAndTabletCheck()

    const app = new Application({ resizeTo: window })
    document.body.appendChild(app.view)

    this.canvasElement = app.view
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

    window.addEventListener("resize", () => {
      this.stage.resize(window.innerWidth, window.innerHeight)
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