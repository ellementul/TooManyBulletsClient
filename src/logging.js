function Logging() {
  return function (payload) {
    switch(payload.message.system) {
      case "Timing":
        // console.log(payload.message)
        break
      case "PlayersManagment":
        // console.log(payload.message)
        break
      case "TileMap":
        // console.log(payload.message)
        break
      case "Characters":
        // console.log(payload.message)
        break

      case "Actions":
        // console.log(payload.message)
        break
      case "World":
        // console.log(payload.message)
        break
      default:
        console.log(payload.message.system)
        null
    }
  }
}

export { Logging }