const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "Actions",
  entity: "Shot"
}, true) 
module.exports = EventFactory(type)