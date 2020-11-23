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

app.get('/wybor', function(req,res) {
	if(req.query.token != null){
		client.query('SELECT * FROM students WHERE token = $1', [req.query.token], (err, resu) => {
			if(err){
				res.send('Przetważanie tego zapytania się nie powiodło, skontaktuj się z nami :((')
			} else {
				if(resu.rows.length != 0){
					res.render('test', {
						sex: resu.rows[0].sex,
						email: resu.rows[0].email,
						class: resu.rows[0].class,
						can1: "Filip Gawlik",
						can2: "Anna Pocztowska",

					})
				} else {
					res.send('Taki token nie istnieje')
				}
			}
		})
	} else {
		res.send('To zapytanie nie posiada poprawnego tokenu wyborów')
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
