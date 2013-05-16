var five = require('johnny-five')

var board = new five.Board();

board.on('ready', function() {

  var fog = new five.Pin(8);

  setInterval(function() {

    fog.high()

    setTimeout(function() {

      fog.low()
    }, 1000)
  }, 3000)
})