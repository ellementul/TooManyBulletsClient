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

  update({ state: { layers: layersData, fullUpdate } }){
    layersData.forEach(layerData => this.updateLayer(layerData))

    if(fullUpdate) {
      const existedUuids = layersData.map(({ uuid }) => uuid)

      for (const [uuid, layer] of this.layers) {
        if(!existedUuids.includes(uuid))
          this.deleteLayer(layer)
      }
    }
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

  deleteLayer(layer) {
    const { uuid, type, tiles } = layer

    tiles.forEach(tileUuid => this.renderer.deleteSprite(tileUuid, type))

    this.layers.delete(uuid, type)
  }

  updateTiles(
    { 
      uuid, 
      texture, 
      position: { row, column }, 
      frame,
      isSpawn 
    }, 
    type, 
    tileSize, 
    oldTiles, 
    updatedTiles
  ) {
    if(isSpawn)
      return

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