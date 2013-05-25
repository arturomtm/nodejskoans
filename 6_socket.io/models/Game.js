var Game = function(){
	this.lastTurn = null;
	this.lastCard = null;
	this.cardsMap = {};
	
	var self = this;
	// I tried to make this method sync to avoid race conditions:
	// sometimes the second player can connect to a game when 
	// cards are not ready, but sync blocks the entire game, so 
	// the next option is to make Game an EventEmitter.
	require('fs').readdir('./public/images/cards/', function(err, cards){
		
		if (err) {
			console.log("Game object. Error readdir");
			return;
		};
		
		for (var i=0, len = cards.length; i<len; i++){
			var foto = cards[i];
			var ins = 0;
			while (ins < 2){
				var j = Math.floor(Math.random() * len * 2) + 1;
				if (self.cardsMap["c" + j] == undefined) {
					self.cardsMap["c" + j] = "images/cards/" + foto;
					++ins;
				}
			}
		}
	});
};

/* jQuery-style empty object checking */
Game.prototype.isOver = function(){
	for (var p in this.cardsMap){
		if ('function' == typeof this.cardsMap[p]) continue;
		return false;
	};
	return true;	
};

exports = module.exports = Game;