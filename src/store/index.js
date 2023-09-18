const { Assets }  = require("pixi.js")
const texturesConfig = require("../../data/assets/textures.json")

let single = null
class Store {
  constructor() {
    if(single)
      return single
    else
      single = this

    this.textures = new Map
  }

  async loadTextures() {
    Assets.addBundle("textures", texturesConfig)
    const textures = await Assets.loadBundle("textures")
    for (const key in textures) {
      this.textures.set(key, textures[key])
    }
    return true
  }

  async loadResources () {
    return await this.loadTextures()
  }

  getTexture(uid) {
    if(!this.textures.has(uid))
      throw new Error(`Texture is not found! Uid: ${uid}`)

    return this.textures.get(uid)
  }
}

module.exports = { Store }