var fs = require('fs')
var request = require('request')

var r = request.post('http://' + process.argv[2] + ':9090/track')
r.on('error', function() {
  console.log("OH GOD IT BROKE")
})
var form = r.form()
form.append('track', fs.createReadStream(process.argv[3]))