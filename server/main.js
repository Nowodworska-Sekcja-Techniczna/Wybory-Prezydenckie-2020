const express = require('express')
const app = express()
const port = 80

app.get('/', (req, res) => {
	res.send('Dupa')
})

app.listen(port, () => {
	console.log('Recieved dup dupa')
})
