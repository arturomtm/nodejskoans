function Mp3SourceStub(library){
	this.playlist = ["Track 01", "Track 02"];
	this.trackNumber = 0;
	this.frameNumber = 0;
	this.paused = true;
}

Mp3SourceStub.prototype.play = function(callback){
	this.paused = false;
	if ( typeof callback == 'function') callback();
}

Mp3SourceStub.prototype.pause = function(callback){
	this.paused = true;
	if ( typeof callback == 'function') callback();
}

Mp3SourceStub.prototype.next = function(callback){
	if ( typeof callback == 'function') callback();
}

Mp3SourceStub.prototype.prev = function(callback){
	if ( typeof callback == 'function') callback();
}

Mp3SourceStub.prototype.list = function(){
	return this.playlist;
}

Mp3SourceStub.prototype.currentTrack = function(){
	return this.playlist[this.trackNumber];
}

exports.Mp3Source = Mp3SourceStub;