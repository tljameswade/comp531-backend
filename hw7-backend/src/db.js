var mongoose = require('mongoose')

// replace this "localhost" value with the one from heroku/mlab
// var url = 'mongodb://heroku_0k2ffrm6:7l31825g4s6r0h7i4m4fsjq6dr@ds145380.mlab.com:45380/heroku_0k2ffrm6'
var url = "mongodb://heroku_jrjc0mzk:l8ghh78159v5l72qb9otd3gsdm@ds011449.mlab.com:11449/heroku_jrjc0mzk"

if (process.env.MONGOLAB_URI) {
	url = process.env.MONGOLAB_URI;
}

mongoose.connect(url)

///////////////////////////////////////////////////
mongoose.connection.on('connected', function() {
	console.log('Mongoose connected to ' + url)
})
mongoose.connection.on('error', function(err) {
	console.error('Mongoose connection error: ' + err)
})
mongoose.connection.on('disconnected', function() {
	console.log('Mongoose disconnected')
})

process.once('SIGUSR2', function() {
	shutdown('nodemon restart', function() {
		process.kill(process.pid, 'SIGUSR2')
	})
})
process.on('SIGINT', function() {
	shutdown('app termination', function() {
		process.exit(0)
	})
})
process.on('SIGTERM', function() {
	shutdown('Heroku app shutdown', function() {
		process.exit(0)
	})
})
function shutdown(msg, callback) {
	mongoose.connection.close(function() {
		console.log('Mongoose disconnected through ' + msg)
		callback()
	})
}
///////////////////////////////////////////////////

