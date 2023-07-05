const { UnitedEventsEnvironment: UEE } = require('@ellementul/united-events-environment')
const { WsTransport } = require('@ellementul/uee-ws-browser-transport')
const { Logging } = require('./logging')

const { Player } = require('./player')
const { TileMap } = require('./tile-map')
const { Characters } = require('./characters')
const { Actions } = require('./actions')

const membersList = {
  roles: [
    Player,
    TileMap,
    Characters,
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