const { UnitedEventsEnvironment: UEE } = require('@ellementul/united-events-environment')
const { Manager } =  require("@ellementul/simple-uee-manager")
const { WsTransport } = require('@ellementul/uee-ws-browser-transport')
const { Logging } = require('./logging')

const { Player } = require('./player')

const membersList = {
  roles: [
    {
      role: "Player",
      memberConstructor: Player
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
  signalServerAddress: "ws://127.0.0.1:8080",
})