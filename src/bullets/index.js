const { Member } = require('@ellementul/united-events-environment')
const { Renderer } = require("../renderer")

const runEvent = require("../events/ready-resources")
const updateEvent = require("../events/update-bullets")

const DEFAULT_BULLET = "default_bullet"
const DEFAULT_LAYER = "foreground"

class Bullets extends Member {
  constructor() {
    super()

    this.renderer = new Renderer
    this.bullets = new Set

    this.onEvent(runEvent, () => this.run())
  }

  run() {
    this.onEvent(updateEvent, payload => this.update(payload))
  }

  update({ state: bullets }) {

    const oldBullets = this.bullets
    const newBullets = new Map

    bullets.forEach(bullet => {
      if(!this.bullets.has(bullet.uuid)) {
        newBullets.set(bullet.uuid, this.createBullet(bullet))
      }
      else {
        const sprite = oldBullets.get(bullet.uuid)
        oldBullets.delete(bullet.uuid)
        this.updateBullet(sprite, bullet)
        newBullets.set(bullet.uuid, sprite)
      }
    })

    for (const [uuid, _] of oldBullets) {
      this.renderer.deleteSprite(uuid, DEFAULT_LAYER)
    }

    this.bullets = newBullets
  }

  createBullet({ uuid, position }) {
    
    const texture = DEFAULT_BULLET
    const layerName = DEFAULT_LAYER
    return this.renderer.addSprite({ uuid, texture, position, layerName })
  }

  updateBullet(bullet, { position }) {
    bullet.position.x = position.x
    bullet.position.y = position.y
  }
}

module.exports = { Bullets }