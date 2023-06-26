const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "PlayersManagment",
  entity: "Resources",
  state: "Ready"
}, true) 
module.exports = EventFactory(type)