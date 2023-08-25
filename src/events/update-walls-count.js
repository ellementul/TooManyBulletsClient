const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "TileMap",
  entity: "WallsCount",
  state: Types.Index.Def(50)
}, true) 
module.exports = EventFactory(type)