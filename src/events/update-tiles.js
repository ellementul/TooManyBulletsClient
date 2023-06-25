const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "World",
  entity: "Tiles",
  action: "Update"
}, true) 
module.exports = EventFactory(type)