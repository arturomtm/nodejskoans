var http = require('http'),
    io = require('socket.io-client'),
	topMemory = require('../socket.io-koans.js'),
    TestingClient = require('../models/TestingClient.js');

describe('Test suite for Top Memory Koans', function(){

	var PORT = 5555;
	var server = http.createServer();
	var topMemoryGame = topMemory.createGame(server).listen(PORT);
	
	it('Koan#1 should make the server to react to incoming connections', function(){
	
		var client;
		var connected = false;
		
		runs(function(){
			client = new TestingClient('koan1', 'http://localhost:5555');
			client.on('connected', function(){
				connected = true;
				this.stopPlaying();
			});
			client.startToPlay( { 'no join' : true } );
		});
		
		waitsFor(function(){
			return connected;
		}, 'the Koan#1 to be completed', 200);
		
		runs(function(){
			expect(function(){ topMemoryGame }).not.toThrow();
			expect(connected).toBe(true);
			client = null;
		});
	});

	var player1, player2;
	var inPlayer1RoomStarts = inPlayer2RoomStarts = null;
	
	it('Koan#2 & Koan#3 should make the server to listen to client-fired events and invoke the ack callback provided', function(){
		
		var username = "player1";
		var playing = false;
		
		runs(function(){
			player1 = new TestingClient(username, 'http://localhost:' + PORT);
			player1.on('gameStarted', function(startInfo){
				inPlayer1RoomStarts = startInfo.players[0];
				playing = true;
			});
			player1.pause();
			player1.startToPlay();
		});
		
		waitsFor(function(){
			return player1.usernameACK != '';
		}, 'the Koans #2 & #5 to be completed', 2000);
		
		runs(function(){
			expect(function(){ topMemoryGame }).not.toThrow();
			expect(player1.usernameACK).toEqual(username);
		});
		
	});
	
	it('Koan#4 should be able to emit events in an specific game room, by example, an start event', function(){
	
		var playing2 = false;
		var playing3 = false;
		var player2ShouldPlay = false;
		var player3ShouldPlay = false;
		var inPlayer2RoomStarts, inPlayer3RoomStarts;
		
		runs(function(){
			var player2Name = 'player2';
			player2 = new TestingClient(player2Name, 'http://localhost:' + PORT);
			player2.on('gameStarted', function(startInfo){
				playing2 = true;
				inPlayer2RoomStarts = startInfo.players[0];
				player2ShouldPlay = startInfo.players.indexOf(player2Name) > -1;
				//console.log(player2Name, ' juega: ', playing2, ' deberia jugar: ', player2ShouldPlay);
			});
			player2.pause();

			// Player3 test the case emit() was used instead in(): 
			// the game works but everyone receives an start event
			var player3Name = 'player3';
			player3 = new TestingClient(player3Name, 'http://localhost:' + PORT);
			player3.on('gameStarted', function(startInfo){
				playing3 = true;
				inPlayer3RoomStarts = startInfo.players[0];
				player3ShouldPlay = startInfo.players.indexOf(player3Name) > -1;
				//console.log(player3Name, ' juega: ', playing3, ' deberia jugar: ', player3ShouldPlay);
			});
			player3.pause();
			
			setTimeout(function(){
				player2.startToPlay();
				player3.startToPlay();
			}, 50);
		});
		
		waitsFor(function(){
			return playing2 || playing3;
		}, 'the Koan#4 to be completed', 1000);

		runs(function(){
			if (playing2 && player2ShouldPlay){
				expect(playing3).not.toEqual(true);
				expect(inPlayer1RoomStarts).toEqual(inPlayer2RoomStarts);
			} else if (playing3 && player3ShouldPlay){
				expect(playing2).not.toEqual(true);
				expect(inPlayer1RoomStarts).toEqual(inPlayer3RoomStarts);	
			}
		});
		
	});

	it('Koan#5 should make the server to emit custom event such as error event', function(){
	
		var failingClient;
		var errorcode = null;
		
		runs(function(){
			failingClient = new TestingClient('', 'http://localhost:5555');
			failingClient.on('loginError', function(error){
				errorcode = error.code;
				this.stopPlaying();
			});
			failingClient.startToPlay();
		});
		
		waitsFor(function(){
			return errorcode != null;
		}, 'the Koan#3 to be completed', 100);
		
		runs(function(){
			expect(errorcode).toBe(0);
			failingClient = null;
		});
	});
	
	it('Koan#6 & Koan#7 should make the server to obtain what room the client is in and to get client info from her socket', function(){
	
		var finished = false;
		var hits = 0;
		var waitingHit = receivedHit = false;
		var estimatedScore = 0;
		
		runs(function(){
			player1.on('success', function(){
				if (player1.myTurn) waitingHit = true;
			});
			player1.on('hit', function(){
				receivedHit = true;
				hits++;
			});
			player1.on('gameEnd', function(){
				finished = true;
			});
			player2.resume();
			player1.resume();
		});
		
		waitsFor(function(){
			return waitingHit && receivedHit && finished;
		}, 'the Koan #6 & #7 to be completed', 3000);
		
		runs(function(){
			expect(player1.score).toBe(hits * 2);
			player1.stopPlaying();
			player2.stopPlaying();
			server.close();
		});
	});
	
});