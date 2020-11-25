var fs = require('fs')
var http = require('http')
var https = require('https')
let mustacheExpress = require('mustache-express');
let bodyParser = require('body-parser');
const { Pool, Client } = require('pg')


const client = new Client({
  user: 'server',
  host: 'localhost',
  database: 'wybory',
  password: 'paszport',
  port: 5432,
})
client.connect()

var privateKey  = fs.readFileSync('/opt/keys/privkey.pem', 'utf8')
var certificate = fs.readFileSync('/opt/keys/fullchain.pem', 'utf8')

var credentials = {key: privateKey, cert: certificate};
var express = require('express')
var app = express()

console.log(__dirname + '/static')

app.set('views', `${__dirname}/views`);
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.use (bodyParser.urlencoded( {extended : true} ) );
app.use(express.static(__dirname + '/static'))

app.post('/oddaj', function(req, res) {
	if(req.body.verified != 1){
		res.render('message', {
			title: 'Nie zaznaczyłeś poprawności danych',
			message: ':(('
		})
		return;
	}

	if(req.body.token == undefined){
		res.render('message', {
			title: 'Nie otrzymaliśmy tokenu',
			message: ':(('
		})
		return;
	}

		
	client.query('SELECT * FROM students WHERE token = $1', [req.body.token], (err, resu) => {
		if(resu.rows[0].choice != null){
			res.render('message', {
				title: 'Ten token został już wykorzystany',
				message: 'Nie możesz oddać głosu jeszcze raz'
			})
			return
		}
		client.query('UPDATE students SET timest = $1, choice = $2 WHERE token = $3', [(new Date()).toISOString(), req.body.choice, req.body.token], (err, resu) => {
			if(err == null){
				res.render('message', {
					title: 'Udało się!',
					message: 'Twój głos został oddany! Możesz to potwierdzic otwierając link z maila jeszcze raz.'
				})
			} else {
				console.log(err)
				res.render('message', {
					title: 'Nie udało się :((',
					message: 'Nastąpił niezdefinioway bład skontaktuj się z nami'
				})
			}
		})
	})
})

app.get('/oddaj', function(req, res) {
	res.render('message', {
		title: 'Nie możesz zGETowac tej storny',
		message: ':(('
	})
})

// Voting
app.get('/glos', function(req,res) {
	if(req.query.token != null){
		client.query('SELECT * FROM students WHERE token = $1', [req.query.token], (err, resu) => {
			if(err){
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
					res.render('message', {
						title: 'Fałszywy token',
						message: 'Taki token nie istnieje'
					})
				}
			}
		})
	} else {
		res.render('message', {
			title: 'Brak tokenu',
			message: 'To zapytanie nie posiada poprawnego tokenu wyborów'
		})
	}
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404).send('Trafiłeś tam gdzie diabeł mówi dobranoc');
});

var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app)

httpServer.listen(80)
httpsServer.listen(443)
