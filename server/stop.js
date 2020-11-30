var fs = require('fs')
var http = require('http')
var https = require('https')
let mustacheExpress = require('mustache-express');
let bodyParser = require('body-parser');
const { Pool, Client } = require('pg')
const pino = require('pino')

const logger = pino({
	prettyPrint: { colorize: true },
	level: 'debug'
	//sync: false
})

const postgres = logger.child({ hostname: 'postgres' })
const node = logger.child({ hostname: 'node-core' })
const htserver = logger.child({ hostname: 'express' })
const veserver = logger.child({ hostname: 'mustache' })

node.debug('successfully inherited all libraries')

const client = new Client({
  user: 'server',
  host: 'localhost',
  database: 'wybory',
  password: 'paszport',
  port: 5432,
})

postgres.debug('client configuration created')

client.connect()

postgres.debug('postgres client has estabilished a connection')

var privateKey  = fs.readFileSync('/opt/keys/privkey.pem', 'utf8')
var certificate = fs.readFileSync('/opt/keys/fullchain.pem', 'utf8')

postgres.info('private keys have been sucesfully loaded')

var credentials = {key: privateKey, cert: certificate};
var express = require('express')
var app = express()

app.set('views', `${__dirname}/views`);

htserver.debug('spinning up the view engine...')

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

veserver.info('mustache is ready, have a good day')

app.use (bodyParser.urlencoded( {extended : true} ) );

htserver.debug('linking static assets')
app.use(express.static(__dirname + '/static'))

htserver.info('static assets are now available')

app.post('/oddaj', function(req, res) {
	htserver.info('recieved post on pusher from ' + req.ip + ' with user agent: ' + req.headers['user-agent'])
	htserver.warn('it\'s over, throwing error')
	res.render('message', {
		title: 'Urny zostały zamknięte',
		message: 'Wybory się zakończyły nie możesz oddać już głosu'
	})
})

// Voting frontend
app.get('/glos', function(req,res) {
	htserver.info('recieved post on pusher from ' + req.ip + ' with user agent: ' + req.headers['user-agent'])
	htserver.warn('it\'s over, throwing error')
	res.render('message', {
		title: 'Urny zostały zamknięte',
		message: 'Wybory się zakończyły nie możesz oddać już głosu'
	})
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404).render('message', {
	title: 'Trafiłeś tam gdzie diabeł mówi dobranoc',
	message: ''
  })
});

var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app)

htserver.info('server started all config done')
httpServer.listen(80)
httpsServer.listen(443)
