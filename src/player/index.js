const { Member, events: { buildEvent } } = require('@ellementul/united-events-environment')
const { Store } = require("../store")
const { Renderer } = require("../renderer")

const pingEvent = require("../events/ping-players")
const pongEvent = require("../events/pong-players")
const loadRenderEvent = require("../events/ready-resources")

const WAIT_FIRST_PING = Symbol("Wait First Ping")
const GOT_FIRST_PING = Symbol("Got First Ping")
const READY = Symbol("Ready")

let single = null
class Player extends Member {
  constructor() {
    super()

    single = this
    this.onEvent(buildEvent, payload => this.setConfig(payload), 1)
    this.onEvent(pingEvent, () => this.ping())

    this._state = WAIT_FIRST_PING
    this.lastPingTime = null
    this.maxPingDeltaTime = 0
  }

  setConfig({ config }) {
    this.config = config
  }

  firstPing() {
    this._state = GOT_FIRST_PING
    this.renderer = new Renderer

    console.info("Got first ping!")

    const store = new Store
    console.info("Resources are loading...")
    store.loadResources(this.config.paths.assets, this.config.env.baseUrl)
      .then(() => this.loadRenderer())
      .catch((err) => {
        console.error(err)
        throw new Error("The Error of loading resources!")
      })
  }

  loadRenderer() {
    this._state = READY
    console.info("Resources are loaded!")
    this.send(loadRenderEvent)
  }

  ping() {
    if(this._state === WAIT_FIRST_PING) {
      this.lastPingTime = Date.now()
      this.firstPing()
    }
    if(this._state === READY) {
      const pingTime = Date.now() - this.lastPingTime

      if(pingTime > this.maxPingDeltaTime)
        this.maxPingDeltaTime = pingTime
      
      this.lastPingTime = Date.now()  
      this.send(pongEvent, { 
        playerUuid: this.uuid,
        deltaTime: pingTime,
        maxDeltaTime: this.maxPingDeltaTime
      })
    }
    if(this._state === GOT_FIRST_PING) {
      console.info("GOT_FIRST_PING is state")
    }
  }
}

module.exports = { 
  Player,
  getPlayerUuid: () => single.uuid
}