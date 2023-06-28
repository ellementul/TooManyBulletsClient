const { Application, Texture, Sprite }  = require("pixi.js")
const { Store } = require("../store")

let single = null
class Renderer {
  constructor() {
    if(single)
      return single
    else
      single = this

    this.store = new Store

    const app = new Application({ width: 96*16, height: 96*16 })
    document.body.appendChild(app.view)

    this.stage = app.stage
  }

  addSprite ({ texture, frame, position }) {

    const baseTexture = this.store.getTexture(texture)

    const sprite = new Sprite(new Texture(baseTexture, frame))
    sprite.position.x = position.x
    sprite.position.y = position.y

    this.stage.addChild(sprite)
  }

}

module.exports = { Renderer }