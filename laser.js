var five = require('johnny-five')
var board = new five.Board()

board.on('ready', function() {

  var laser = new five.Led(8)

  laser.strobe()

})