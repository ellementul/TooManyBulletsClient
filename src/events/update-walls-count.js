const { EventFactory, Types } = require('@ellementul/united-events-environment')
const type = Types.Object.Def({
  system: "TileMap",
  entity: Types.Any.Def([
    Types.Const.Def("WallsCount"),
    Types.Const.Def("PlatformsCount")
  ]),
  state: Types.Index.Def(256*256)
}, true) 
module.exports = EventFactory(type)