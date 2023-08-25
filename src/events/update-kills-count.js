const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "Characters",
  entity: "KillsCount",
  state: Types.Index.Def(256*256)
}, true) 
module.exports = EventFactory(type)