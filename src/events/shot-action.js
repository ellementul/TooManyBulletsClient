const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "Actions",
  entity: "IsShot",
  playerUuid: Types.UUID.Def(),
  state: Types.Bool.Def()
}, true) 
module.exports = EventFactory(type)