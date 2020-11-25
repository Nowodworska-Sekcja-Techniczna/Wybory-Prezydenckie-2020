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

//var privateKey  = fs.readFileSync('/opt/keys/privkey.pem', 'utf8')
//var certificate = fs.readFileSync('/opt/keys/fullchain.pem', 'utf8')

postgres.info('private keys have been sucesfully loaded')

//var credentials = {key: privateKey, cert: certificate};
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
	if(req.body.verified != 1){
		htserver.warn('the request didnt contain a verification signature, throwing error')
		res.render('message', {
			title: 'Nie zaznaczyłeś poprawności danych',
			message: ':(('
		})
		return
	}

	if(req.body.token == undefined){
		htserver.warn('the request didnt contain a token, throwing error')
		res.render('message', {
			title: 'Nie otrzymaliśmy tokenu',
			message: ':(('
		})
		return;
	}

	htserver.debug('sufficient information to SELECT from db with token')
	client.query('SELECT * FROM students WHERE token = $1', [req.body.token], (err, resu) => {
		if(resu.rows == undefined){
			htserver.warn('token ' + req.body.token + ' does not exist, throwing error')
			res.render('message', {
				title: 'Ten token nie istnieje',
				message: 'Jeżeli to twoj prawdziny token skontaktuj sie z nami'
			})
			return
		}
		if(resu.rows[0].choice != null){
			htserver.error('token ' + req.body.token + ' tried to cheat and vote again, throwing error')
			res.render('message', {
				title: 'Ten token został już wykorzystany',
				message: 'Nie możesz oddać głosu jeszcze raz'
			})
			return
		}

		if(req.body.choice != 1 || req.body.choice != 2){
			htserver.warn('token ' + req.body.token + ' tried to cheat and vote for a non existant candiadate, throwing error')
			res.render('message', {
				title: 'Taki kandydat nie istnieje',
				message: 'Chyba troszke oszukujesz'
			})
			return
		}

		postgres.debug('full vote acceppted running UPDATE')
		client.query('UPDATE students SET timest = $1, choice = $2 WHERE token = $3', [(new Date()).toISOString(), req.body.choice, req.body.token], (err, resu) => {
			if(err == null){
				htserver.info(resu.rows[0].email + ' successfully voted')
				res.render('message', {
					title: 'Udało się!',
					message: 'Twój głos został oddany! Możesz to potwierdzic otwierając link z maila jeszcze raz.'
				})
			} else {
				postgres.error('database error ' + err)
				res.render('message', {
					title: 'Nie udało się :((',
					message: 'Nastąpił niezdefinioway bład skontaktuj się z nami'
				})
			}
		})
	})
})

// 
app.get('/oddaj', function(req, res) {
	htserver.debug('recieved get on pusher from ' + req.ip + ' with user agent: ' + req.headers['user-agent'])
	htserver.warn('pusher can\'t be get displaying error')
	res.render('message', {
		title: 'Nie możesz zGETowac tej storny',
		message: ':(('
	})
})

// Voting frontend
app.get('/glos', function(req,res) {
	htserver.info('recieved get on frontend from ' + req.ip + ' with user agent: ' + req.headers['user-agent'])
	if(req.query.token != null){
		postgres.debug('token valid running SELECT')
		client.query('SELECT * FROM students WHERE token = $1', [req.query.token], (err, resu) => {
			if(err){
				postgres.error('database error ' + err)
				res.render('message', {
					title: 'Bład wewnętrzny',
					message: 'Przetważanie tego zapytania się nie powiodło, skontaktuj się z nami :(('
				})
			} else {
				if(resu.rows.length != 0){
					if(resu.rows[0].choice != null){
						res.render('message', {
							title: 'Ten token został już wykorzystany',
							message: 'Nie możesz oddać głosu jeszcze raz'
						})
						return
					}
					postgres.debug('token valid running SELECT class')
					client.query('SELECT * FROM classes WHERE id = $1', [resu.rows[0].class], (err, classres) => {

						var sextex = "";
						switch(resu.rows[0].sex){
							case 1:
								sextex = "Mężczyzna"
								break
							case 2:
								sextex = "Kobieta"
								break
							case 3:
								sextex = "Inna"
								break
						}

						veserver.info('rendering frontend')
						res.render('index', {
							sex: sextex,
							email: resu.rows[0].email,
							class: classres.rows[0].name,
							can1: "Filip Gawlik",
							can2: "Anna Pocztowska",
							token: resu.rows[0].token
						})
					})
				} else {
					htserver.warn('invalid token, throwing error')
					res.render('message', {
						title: 'Fałszywy token',
						message: 'Taki token nie istnieje'
					})
				}
			}
		})
	} else {
		htserver.warn('request without token, throwing error')
		res.render('message', {
			title: 'Brak tokenu',
			message: 'To zapytanie nie posiada poprawnego tokenu wyborów'
		})
	}
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  htserver.warn('someone tried to access 404')
  res.status(404).render('message', {
	title: 'Trafiłeś tam gdzie diabeł mówi dobranoc',
	message: ''
	})
});

var httpServer = http.createServer(app)
//var httpsServer = https.createServer(credentials, app)

httpServer.listen(80)
//httpsServer.listen(443)
