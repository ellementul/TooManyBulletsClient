const { Assets }  = require("pixi.js")

let single = null
class Store {
  constructor() {
    if(single)
      return single
    else
      single = this

    this.textures = new Map
  }

  async loadTextures(texturesConfig) {
    Assets.addBundle("textures", texturesConfig)
    const textures = await Assets.loadBundle("textures")
    for (const key in textures) {
      this.textures.set(key, textures[key])
    }
    return true
  }

  async loadResources (paths, baseUrl) {
    const response = await fetch(baseUrl + paths.textures)

    if(!response.ok)
      throw new Error(`I cannot load list of textures from ${baseUrl + paths.textures}`)

    const texturesConfig = await response.json()
    for (const name in texturesConfig)
      texturesConfig[name] = baseUrl + texturesConfig[name]

    console.log(texturesConfig)
    return await this.loadTextures(texturesConfig, baseUrl)
  }

  getTexture(uid) {
    if(!this.textures.has(uid))
      throw new Error(`Texture is not found! Uid: ${uid}`)

    return this.textures.get(uid)
  }
}

module.exports = { Store }