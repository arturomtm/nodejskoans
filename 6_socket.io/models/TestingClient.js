var util = require("util"),
	events = require("events"),
	io = require('socket.io-client');

var DEBUG = false;

var TestingClient = function(username, url){

	events.EventEmitter.call(this);
	
	this.url = url;
	this.me = username;
	this.usernameACK = '';
	this.score = 0;
	this.memory = {};
	for (var i=1; i<=40; i++) this.memory["c" + i] = null;
	this.myTurn = false;
	this.paused = false;
	this.sentCard = null;
	this.socket;
};

util.inherits(TestingClient, events.EventEmitter);

TestingClient.prototype.startToPlay = function(options){
	
	var self = this;
	
	this.socket = io.connect( this.url, { "force new connection": true } );

	this.socket.on('connect', function(){
		if (options && options['no join']) {
			return;
		}
		this.emit('joins', { username: self.me }, function(ack){
			self.usernameACK = ack;
		});
	});

	this.socket.on('connectionDone', function(){
		self.emit('connected');
	});

	this.socket.on('error', function(error){
		switch (error.code){
			case 0:
			case 1:
				self.emit('loginError', error);
				break;
		}
	});
	
	this.socket.on('start', function(data){
		self.emit('gameStarted', data);
		if (data.players[0] == self.me) {
			if (DEBUG) console.log("[" + self.me + "] ","Empiezo");
			self.myTurn = true;
			self.play();
		}
	});
	
	this.socket.on('discover', function(data){
		if (DEBUG && self.memory[data.id] == null) console.log("[" + self.me + "] ", 'Memorizo ', data.id, ':', data.src);
		self.memory[data.id] = data.src;
		//if (self.myTurn && data.id == self.sentCard) {
		if (data.id == self.sentCard) {
			self.play();
		};
	});
	
	this.socket.on('success', function(data){
		self.emit('success');
		delete self.memory[data.ids[0]];
		delete self.memory[data.ids[1]];
		self.sentCard = null;
		self.play();
		//if (self.myTurn) self.play();
	});
	
	this.socket.on('score', function(data){
		if (self.me == data.username ) {
			self.emit('hit');
			self.score = data.score;
		}
	});
	
	this.socket.on('fail', function(data){
		self.myTurn = !self.myTurn;
		self.sentCard = null;	
		if (self.myTurn) {
			self.play();
			if (DEBUG) console.log("[" + self.me + "] ","Mi turno");
		} else {
			if (DEBUG) console.log("[" + self.me + "] ","Tu turno");
		}
	});	
	
	this.socket.on('finish', function(){
		if (DEBUG) console.log("[" + self.me + "] ", 'Final ', self.score);
		self.emit('gameEnd');
		this.disconnect();
	});	 
};

TestingClient.prototype.play = function(){
	
		if (!this.myTurn || this.paused) return;
		
		var sendCandidate = null;
		var pairFound = false;
				
		for (var m in this.memory){
			if (this.memory[m] != null){
				for (var n in this.memory){
					if (n != m && this.memory[n] == this.memory[m]){
						pairFound = true;
						if (this.sentCard == m){
							// Caso 1: Se ha descubierto una carta que estaba en memoria, su pareja esta tambien en memoria y se envia ahora
							if (DEBUG) console.log("[" + this.me + "] ","Descubro ", n, ':', this.memory[n], " (1)");
							this.socket.emit('discover', { id: n });
						} else if (this.sentCard == n){
							// Caso 2: Se ha descubierto una carta que no conocia y se tiene en memoria a su pareja que se envia ahora
							if (DEBUG) console.log("[" + this.me + "] ","Descubro ", m, ':', this.memory[m], " (2)");
							this.socket.emit('discover', { id: m });
						} else {
							// Caso 3: la ultima que descubrio mi oponente tiene pareja pero yo aun no he enviado ninguna
							if (DEBUG) console.log("[" + this.me + "] ","Descubro ", m, ':', this.memory[m], " (3)");
							this.sentCard = m;
							this.socket.emit('discover', { id: m });
						}
						break;
					}
				};
				if (pairFound) break; // Si hay pareja, se sale del primer bucle tambien
			} else if (!sendCandidate) {
				sendCandidate = m;
			}
		}
		if (!pairFound && m != null){
			// Caso 0: no hay parejas, se envia la primera carta no conocida (primer null)
			if (DEBUG) console.log("[" + this.me + "] ","Descubro ", sendCandidate, ':', this.memory[sendCandidate], " (0)");
			if (!this.sentCard) this.sentCard = sendCandidate;
			this.socket.emit('discover', { id: sendCandidate });
		}
	};

TestingClient.prototype.stopPlaying = function(){
	this.socket.disconnect();
};

TestingClient.prototype.pause = function(){
	this.paused = true;
	if (DEBUG) console.log("[" + this.me + "] ", "Pausado");
};

TestingClient.prototype.resume = function(){
	if (DEBUG) console.log("[" + this.me + "] ", "Reanudado");
	this.paused = false;
	this.play();
};

exports = module.exports = TestingClient;