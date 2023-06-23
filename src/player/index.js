const { Member } = require('@ellementul/united-events-environment')
const { Store } = require("../store")

const pingEvent = require("../events/ping-players")
const pongEvent = require("../events/pong-players")

const WAIT_FIRST_PING = Symbol("Wait First Ping")
const GOT_FIRST_PING = Symbol("Got First Ping")
const READY = Symbol("Ready")
class Player extends Member {
  constructor() {
    super()

    this.onEvent(pingEvent, () => this.ping())

    this._state = WAIT_FIRST_PING
  }

  firstPing() {
    this._state = GOT_FIRST_PING
    const store = new Store
    store.loadResources()
      .then(() => this.loadRenderer())
      .catch(() => { throw new Error("The Error of loading resources!") })
  }

  loadRenderer() {
    this.ping()
    this._state = READY
  }

  ping() {
    if(this._state == WAIT_FIRST_PING)
      return this.firstPing()

    this.send(pongEvent, { playerUuid: this.uuid })
  }
}

module.exports = { Player }