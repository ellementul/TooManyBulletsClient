const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "Actions",
  entity: "Moving"
}, true) 
module.exports = EventFactory(type)