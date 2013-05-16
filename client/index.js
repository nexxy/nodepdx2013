var shoe = require('shoe')
var dnode = require('dnode')
var stream = shoe('/dnode', function() {

  console.log('Sock established')
})

var remote, color = 0

var d = dnode({

  // someone else is clicking fog button
  fogging : function(f) {

    if(f == true) { return $('#fog').addClass('active') }
    $('#fog').removeClass('active')
  }
  , lasers : function(p) {

    if(p == true) { return $('#laser').addClass('active') }
    $('#laser').removeClass('active')
  }
  , playing : function(name) {

    if(!name) { return }
    $('#playing').html('now playing: ' + name)
  }
  , track : function(name) {

    if(!name) { return }
    newTrack(name, remote)
  }
  , tracks : function(tracks) {

    tracks.forEach(function(name) {
      newTrack(name, remote)
    })
  }
  , color : function(dat) {

    console.log('color', dat)
    var distance = Math.round(360 * dat / 5000 );

    var color = $.Color({
      hue : distance
      , saturation : 100
      , lightness : .5
      , alpha : 1
    }).toHslaString();

    var comp = $.Color({
      hue : distance
      , saturation : 50
      , lightness : .2
      , alpha : 1
    }).toHslaString();

    $('body').stop(true).animate({
      backgroundColor : color
    }, 1000);

    $('body').animate({
      color : comp
    }, 1300);

    $('.hero-unit').stop(true).animate({
      backgroundColor : color
    }, 1500);

    color = distance;
  }
})

$(function() {

  d.on('remote', function(r) {
    remote = r
    $('#laser').mousedown(function(e) { r.yesLaser() })
    $('#laser').mouseup(function(e) { r.noLaser() })
    $('#fog').mousedown(function(e) { r.yesFog() })
    $('#fog').mouseup(function(e) { r.noFog() })
  })
  d.pipe(stream).pipe(d)

})

function newTrack(name, remote) {

  return $('<div>')
    .html($('<p class="lead">' + name + '</p>'))
    .append(bindTrack($('<button class="track btn btn-large">').html('PLAY!'), name, remote))
    .append($('<hr />'))
    .appendTo($('#tracks'))
}

function bindTrack(track, name, remote) {

  return track.on('click', function() {

    if(!remote) { return }
    remote.play(name)
  })
}