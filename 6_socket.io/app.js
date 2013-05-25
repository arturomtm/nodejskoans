var express = require('express'),
	http = require('http'),
	topMemory = require('./socket.io-koans.js');
	
var app = express();
app.configure(function(){
	app.use(express.favicon());
	app.use(express.static(__dirname + '/public'));
	app.use(express.bodyParser());
});

var server = http.createServer(app);

topMemory.createGame(server).listen(5555);