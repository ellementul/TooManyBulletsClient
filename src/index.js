const { UnitedEventsEnvironment: UEE } = require('@ellementul/united-events-environment')
const { WsTransport } = require('@ellementul/uee-ws-browser-transport')
const { Logging } = require('./logging')

const { Player } = require('./player')
const { Viewport } = require('./viewport')
const { TileMap } = require('./tile-map')
const { Characters } = require('./characters')
const { Bullets } = require('./bullets')
const { Actions } = require('./actions')

const membersList = {
  roles: [
    Player,
    Viewport,
    TileMap,
    Characters,
    Bullets,
    Actions
  ]
}

env = new UEE({
  Transport: WsTransport,
  membersList,
  logging: Logging(),
  isShowErrors: true
})


env.run({ signalServerAddress: "ws://192.168.0.4:8080" })