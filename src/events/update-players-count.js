const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "PlayersManagment",
  entity: "PlayersCount",
  state: Types.Index.Def(50)
}, true) 
module.exports = EventFactory(type)