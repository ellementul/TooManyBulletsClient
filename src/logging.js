function Logging() {
  return function (payload) {
    switch(payload.message.access) {
      case "Local":
        console.log("Client", payload.message)
        break
      default:
        null
    }
  }
}

export { Logging }