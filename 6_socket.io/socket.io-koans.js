var socketio = require('socket.io'),
	uuid = require('node-uuid'),
	Game = require('./models/Game.js'),
	util = require('util'),
	koanize = require('koanizer');

var room2game = {},
	waitingRoom = null,
	startingPlayer = null,
	io = null;

koanize(this);

exports.createGame = function(server){

	io = socketio.listen(server);
	io.set('log level', 1);

	/*
		KOAN #1
		Server must be able to receive incoming connections
	*/
	io.sockets.on(___, function(socket){
		/*
			KOAN #2
			The server must be able to properly act to joins messages from client
		*/
		socket.___('joins', function(message, callback){

			var username = message.username;
			
			if (username && username != '' && startingPlayer != username){
				socket.set('username', username);
				socket.set('score', 0);
				/*
					KOAN #3
					As result of the joins message, the Server must acknowledge
					it sending the username back to the client
				*/				
				___(username);
				
				if (!waitingRoom){
					startingPlayer = username;
					waitingRoom = uuid.v1();
					room2game[waitingRoom] = new Game();
					socket.join(waitingRoom);
				} else {
					room2game[waitingRoom].lastTurn = username;
					socket.join(waitingRoom);
					/*
						KOAN #4
						Having two players in a room, the server must be able to
						notify both the start of the game
					*/
					io.sockets.___(waitingRoom).emit('start', { players: [startingPlayer, username] });
					waitingRoom = null;
					startingPlayer = null;
				};
			} else {
				/*
					KOAN #5
					The server must handle properly faulty inputs
				*/
				socket.___('error', { code: 0, msg: 'Username not provided, invalid or duplicated' });
			}
			
		});
		
		socket.on('discover', function(card){

			var socket = this;
			var id = card.id;
			
			var roomId = '';
			/*
				KOAN #6
				The server must be able to know what room the client is in
			*/
			for (roomId in io.sockets.manager.___[socket.id]){
				if (roomId != '') break;
			};
			roomId = roomId.substring(1);
			var room = io.sockets.in(roomId);
			var game = room2game[ roomId ];
			
			if (game === undefined || !(id in game.cardsMap)) {
				return;
			}

			/*
				KOAN #7 (I)
				The socket must obtain any client info from the socket
			*/
			socket.___('username', function(err, username){
				
				if (err) {
					console.log("Discover: error recuperando username", err);
					process.exit();
				}

				if (game.lastTurn != username){
				
					room.emit('discover', { id: id, src: game.cardsMap[id] });
					
					var lastId = game.lastCard;
					if (lastId == null || lastId == id) {
						game.lastCard = id;
						return;
					};
					
					if (game.cardsMap[lastId] == game.cardsMap[id]){
						
						delete game.cardsMap[lastId];
						delete game.cardsMap[id];
						game.lastCard = null;
						
						room.emit('success', { ids: [lastId, id] });
						/*
							KOAN #7 (II)
							The socket must obtain any client info from the socket
							and, once updated, save in it again
						*/
						socket.___('score', function(err, score){
							score += 2;
							socket.___('score', score);
							room.emit('score', { username: username, score: score } ); 
						});
					} else {
						game.lastTurn = username;
						game.lastCard = null;
						room.emit('fail', { ids: [ lastId, id ], src: "images/back.png" });
					};
					
					if (game.isOver()) {
						room.emit('finish');
						delete room2game[roomId];
					}
					
				}
			});
		});
		
		// To ignore: testing purposes
		socket.emit('connectionDone');

	});

	return server;
}

exports.endGame = function(){
	if (io) {
		io.server.close();
	}
}