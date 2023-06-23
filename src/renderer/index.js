const { Application }  = require("pixi.js");

let single = null
class Renderer {
  constructor() {
    if(single)
      return single
    else
      single = this

    const app = new Application
    document.body.appendChild(app.view)
  }
}