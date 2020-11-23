var fs = require('fs')
var http = require('http')
var https = require('https')
var privateKey  = fs.readFileSync('/opt/keys/privkey.pem', 'utf8')
var certificate = fs.readFileSync('/opt/keys/fullchain.pem', 'utf8')

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

app.use(express.static('static'))

app.get('/wyborinsko', function(req,res) {
    res.send('hello');
});


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443);
