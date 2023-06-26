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
    const { tiles, tileSize, size } = layers[0]

    tiles.forEach(({ texture, position: { row, column }, frame }) => {
      const tileHash = this.hash({ texture, position: { row, column } })
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

  hash({ texture, position }) {
    return texture + "r" + position.row + "c" + position.column
  }
}

module.exports = { TileMap }