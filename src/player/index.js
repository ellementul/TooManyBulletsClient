const { Member } = require('@ellementul/united-events-environment')
const pingEvent = require("../events/ping-players")
const pongEvent = require("../events/pong-players")


class Player extends Member {
  constructor() {
    super()

    this.onEvent(pingEvent, () => this.ping())
  }

  ping() {
    this.send(pongEvent)
  }
}

module.exports = { Player }