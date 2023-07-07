const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-tiles")

class TileMap extends Member {
  constructor() {
    super()

    this.renderer = new Renderer
    this.layers = new Map

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.onEvent(updateEvent, payload => this.update(payload))
  }

  update({ state: { layers } }){
    layers.forEach(layer => this.updateLayer(layer));
  }

  updateLayer(layer) {
    const { uuid, type, tiles, tileSize } = layer

    if(!this.layers.has(uuid))
      this.layers.set(uuid, {
        uuid,
        type,
        tiles: new Set
      })

    const updatedTiles = new Set
    const oldTiles = this.layers.get(uuid).tiles

    tiles.forEach(tile => this.updateTiles(tile, type,  tileSize, oldTiles, updatedTiles))

    this.layers.get(uuid).tiles = updatedTiles

    oldTiles.forEach(tileUuid => this.renderer.deleteSprite(tileUuid, type))
  }

  updateTiles(
    { 
      uuid, 
      texture, 
      position: { row, column }, 
      frame 
    }, 
    type, 
    tileSize, 
    oldTiles, 
    updatedTiles
  ) {
    const position = {
      x: column * tileSize.width,
      y: row * tileSize.height,
    }
  
    updatedTiles.add(uuid)

    if(!oldTiles.has(uuid))
      this.renderer.addSprite({uuid, texture, position, frame, layerName: type })
  
    oldTiles.delete(uuid)
  }
}

module.exports = { TileMap }