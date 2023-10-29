const { UnitedEventsEnv, Room } = require('@ellementul/united-events-environment')
const { Logging } = require('./logging')

function PlayerFactory({ transport } = {}) {

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

  env.setupLogging({
    logging: Logging()
  })
  env.build(transport)

  return env
}

module.exports = { PlayerFactory }