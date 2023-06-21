function Logging() {
  return function (payload) {
    switch(payload.message.system) {
      case "Timing":
        break
      case "Cooperation":
        break
      default:
        null
    }
  }
}

module.exports = { Logging }