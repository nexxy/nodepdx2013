var os = require('os')
var fs = require('fs')
var shoe = require('shoe')
var dnode = require('dnode')
var stream = require('stream')
var colors = require('colors')
var express = require('express')
var five = require('johnny-five')
var exec = require('child_process').exec

var app = express()

var laser, fog, ping, playing, tracks = [ ]

var bcast = new stream.Stream()
bcast.setMaxListeners(200)

var host = os.networkInterfaces().en0[1].address || undefined
if(!host) { console.log("Unable to retrieve hostname."); process.exit(1) }
console.log('\n\nJOIN THE PARTY:'.magenta)
console.log('>> visit: http://%s:9090/', host, '\n')
console.log('SETUP:'.magenta)
console.log('>> git clone https://github.com/nexxy/nodepdx2013')
console.log('>> npm install\n')
console.log('CONTRIBUTE:'.green)
console.log('>>> node upload %s <filename>\n\n', host)
var board = new five.Board()
board.on('ready', function() {

  laser = new five.Pin(8)
  ping = new five.Ping(4)
  fog = new five.Pin(7)

  ping.on('change', function(err, val) {

    if(err) { return }
    bcast.emit('color', val)

  })
  laser.low()
  fog.high()
})

fs.readdir(__dirname + '/uploads/', function(err, files) {

  if(err) { throw err }

  files.forEach(function(track) {
    tracks.push(track)
  })
})

var sock = shoe(function(stream) {

  console.log('Sock connected.')
  var d = dnode({

    yesFog : yesFog.bind(bcast)
    , noFog : noFog.bind(bcast)
    , yesLaser : yesLaser.bind(bcast)
    , noLaser : noLaser.bind(bcast)
    , play : playTrack.bind(bcast)
  })

  d.on('remote', function(remote) {

    remote.tracks(tracks)
    remote.playing(playing)

    bcast.on('lasers', function(status) {
      if(!remote) { return }
      remote.lasers(status)
    })

    bcast.on('fogging', function(status) {
      if(!remote) { return }
      remote.fogging(status)
    })

    bcast.on('track', function(name) {
      if(!remote) { return }
      remote.track(name)
    })

    bcast.on('playing', function(name) {
      if(!remote) { return }
      remote.playing(name)
    })

    bcast.on('color', function(val) {
      if(!remote) { return }
      remote.color(val)
    })
  })
  d.pipe(stream).pipe(d)
})

app.use(express.static(__dirname + '/static'))
app.use(express.bodyParser())

app.post('/track', function(req, res, next) {

  if((!req.files) || !req.files.track) { return }
  fs.createReadStream(req.files.track.path)
    .pipe(fs.createWriteStream(__dirname + '/uploads/' + req.files.track.name))
    .on('close', function() {
      console.log('upload finished: %s', req.files.track.name)
      bcast.emit('track', req.files.track.name)
      tracks.push(req.files.track.name)
    })
  res.end()
})

sock.install(app.listen(9090), '/dnode')

function yesFog() {
  this.emit('fogging', true)
  if(fog) { fog.low() }
}

function noFog() {
  this.emit('fogging', false)
  if(fog) { fog.high() }
}

function yesLaser() {
  this.emit('lasers', true)
  if(laser) { laser.high() }
}

function noLaser() {
  this.emit('lasers', false)
  if(laser){  laser.low() }
}
function playTrack(name) {
  playing = name
  this.emit('playing', name)
  exec('pkill afplay', function() {
    exec('afplay ' + __dirname + '/uploads/' + name)
  })
  console.log('Playing: %s', name)
}