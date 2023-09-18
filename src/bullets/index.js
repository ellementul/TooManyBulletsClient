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
    this.onEvent(updateEvent, payload => this.update(payload), -1)
  }

  update({ state: bulletsData }) {

    const oldBullets = this.bullets
    const newBullets = new Map

    bulletsData.forEach(bulletData => {
      if(!this.bullets.has(bulletData.uuid)) {
        newBullets.set(bulletData.uuid, this.createBullet(bulletData))
      }
      else {
        const bullet = oldBullets.get(bulletData.uuid)
        oldBullets.delete(bulletData.uuid)
        this.updatePosition(bullet, bulletData.position)
        newBullets.set(bulletData.uuid, bullet)
      }
    })

    for (const [uuid, _] of oldBullets) {
      this.renderer.deleteSprite(uuid, DEFAULT_LAYER)
    }

    this.bullets = newBullets
  }

  createBullet({ uuid, position }) {
    
    const texture = DEFAULT_BULLET

    const bullet =  this.renderer.addSpritesAsOne({
      uuid,
      sprites: [
        {
          name: "bullet",
          position: { x: 0, y: 0 },
          texture,
          isCentred: true
        }
      ],
      layerName: DEFAULT_LAYER
    })

    this.updatePosition(bullet, position)

    return bullet
  }

  updatePosition(bullet, position) {
    bullet.position.x = position.x
    bullet.position.y = position.y
  }
}

module.exports = { Bullets }