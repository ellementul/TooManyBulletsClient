const { UnitedEventsEnvironment: UEE } = require('@ellementul/united-events-environment')
const { Manager } =  require("@ellementul/simple-uee-manager")
const { WsTransport } = require('@ellementul/uee-ws-browser-transport')
const { Logging } = require('./logging')

const { Player } = require('./player')
const { TileMap } = require('./tile-map')
const { Characters } = require('./characters')

const membersList = {
  roles: [
    {
      role: "Player",
      memberConstructor: Player
    },
    {
      role: "TileMap",
      memberConstructor: TileMap
    },
    {
      role: "Characters",
      memberConstructor: Characters
    }
  ]
}

env = new UEE({
  Transport: WsTransport,
  Manager,
  membersList,
  logging: Logging(),
  isShowErrors: true
})


env.run({
  isHost: false,
  signalServerAddress: "ws://192.168.0.4:8080",
})