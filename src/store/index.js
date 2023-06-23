const { Assets }  = require("pixi.js")
const texturesConfig = require("../assets/textures.json")

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
}

module.exports = { Store }