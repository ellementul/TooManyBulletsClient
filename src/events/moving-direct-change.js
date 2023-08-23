const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "Actions",
  entity: "MovingDirect",
  playerUuid: Types.UUID.Def(),
  state: {
    x: Types.Number.Def(1, -1, 3),
    y: Types.Number.Def(1, -1, 3)
  }
}, true) 
module.exports = EventFactory(type)