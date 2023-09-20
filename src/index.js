const { UnitedEventsEnv, Room } = require('@ellementul/united-events-environment')
const { WsTransport } = require('@ellementul/uee-ws-browser-transport')
const { Logging } = require('./logging')

function PlayerFactory({ address, baseUrl } = {}) {

  const { Player } = require('./player')
  const { Viewport } = require('./viewport')
  const { TileMap } = require('./tile-map')
  const { Characters } = require('./characters')
  const { Bullets } = require('./bullets')
  const { Actions } = require('./actions')

  const room = new Room
  room.addMember(Player)
  room.addMember(Viewport)
  room.addMember(TileMap)
  room.addMember(Characters)
  room.addMember(Bullets)
  room.addMember(Actions)

  const env = new UnitedEventsEnv(room)
  const config = env.getConfig()
  const isBrowserApi = config.env.browserApi
  const signalAddress = address || config.signalAddress

  if(!isBrowserApi)
    throw new Error("Render doesn't work without browser API!")

  const transport = new WsTransport(signalAddress)
  transport.url = baseUrl

  env.setupLogging({})
  env.build(transport)

  return env
}

module.exports = { PlayerFactory }