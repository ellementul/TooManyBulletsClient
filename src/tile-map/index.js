const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-tiles")

class TileMap extends Member {
  constructor() {
    super()

    this.renderer = new Renderer
    this.tiles = new Set

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.onEvent(updateEvent, payload => this.update(payload))
  }

  update({ state: { layers } }){

    this.updateLayer(layers["background"])
    this.updateLayer(layers["walls"])
  }

  updateLayer(layer) {
    const { tiles, tileSize, size, name } = layer

    tiles.forEach(({ texture, position: { row, column }, frame }) => {
      const tileHash = this.hash({ texture, position: { row, column }, layerName: name })
      const position = {
        x: column * tileSize.width,
        y: row * tileSize.height,
      }

      if(!this.tiles.has(tileHash)) {
        this.tiles.add(tileHash)
        this.renderer.addSprite({ texture, position, frame })
      }
    });
  }

  hash({ texture, position: { row, column }, layerName }) {
    return texture + "r" + row + "c" + column + layerName
  }
}

module.exports = { TileMap }