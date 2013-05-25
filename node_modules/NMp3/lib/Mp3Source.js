var events = require('events'),
	util = require('util');

var SAMPLES_PER_FRAME = 1152; // from ISO11172
var SAMPLING_FREQUENCY = 44100;
var SECONDS_PER_FRAME = SAMPLES_PER_FRAME / SAMPLING_FREQUENCY;

function Mp3Source(library){

	events.EventEmitter.call(this);

	this.library = library;
	this.playlist = library.getPlaylist();

	this.trackNumber = 0;
	this.frameNumber = 0;
	this.paused = false;
	
	var self = this;
	
	setInterval(function(){
	
		if (self.paused) return;
		
		var frame = library.songsDB[ self.playlist[self.trackNumber] ][self.frameNumber++];
		if (frame) {
			self.emit('frame', frame);
		} else {
			self.next();
		}
	}, SECONDS_PER_FRAME * 1000);
}

util.inherits(Mp3Source, events.EventEmitter);

Mp3Source.prototype.play = function(callback){
	this.paused = false;
	if (typeof callback == 'function') callback();
	this.emit('track', this.playlist[this.trackNumber]);
}

Mp3Source.prototype.pause = function(callback){
	this.paused = true;
	if (typeof callback == 'function') callback();
	this.emit('pause', this.playlist[this.trackNumber]);
}

Mp3Source.prototype.stop = function(){
	this.paused = true;
    // It would be desirable that 'stop'
    // destroyed SetInterval to destroy
    // the source later
}

Mp3Source.prototype.next = function(callback){
	this.frameNumber = 0;
	if (++this.trackNumber > this.playlist.length - 1) {
		this.pause();
		this.trackNumber = 0;
		if ( typeof callback == 'function') callback();
		this.emit('listEnd');
		return;
	}
	if (typeof callback == 'function') callback();
	this.emit('track', this.playlist[this.trackNumber]);
}

Mp3Source.prototype.prev = function(callback){
	this.frameNumber = 0;
	if (--this.trackNumber < 0) {
		this.trackNumber = 0;
		if ( typeof callback == 'function') callback();
		this.emit('listBegining');
		return;
	}
	if (typeof callback == 'function') callback();
	this.emit('track', this.playlist[this.trackNumber]);
}

Mp3Source.prototype.list = function(){
	return this.playlist;
}

Mp3Source.prototype.currentTrack = function(){
	return this.playlist[this.trackNumber];
}

module.exports = exports.Mp3Source = Mp3Source;
