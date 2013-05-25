var events = require('events'), 
    util = require('util'),
	fs = require('fs');

// MP3 frames constants and masks
var DEFAULT_BITRATE = 128 * 1000;
var MP3_FRAME_HEADER_SIZE = 4;
var SYNC_MASK = 0xFFF00000;
var MP3_SIGNATURE = 0x000A0000;

function Mp3Library(options){
	
	events.EventEmitter.call(this);
	
	this.basedir = options.basedir || './songs/';
	this.songsDB = {};
	
	var self = this;
	
	fs.readdir(self.basedir, function(err, files){
		if (err) throw new Error(err);
		
		self.playlist = files;
		self.tracks = self.playlist.length;
		self.trackNumber = -1;
		
		self.generateTrack();
	});
}
util.inherits(Mp3Library, events.EventEmitter);

Mp3Library.prototype.generateTrack = function(){

	var self = this;
		
	if (!this.playlist[++this.trackNumber]) {
		self.emit("ready", self.playlist);
		return;
	}

	var songName = this.playlist[this.trackNumber];
	fs.readFile(this.basedir + songName, function(err, song){
		
		if (err) {
			console.log("Error reading file", err);
			self.generateTrack();
			return;
		}
		
		if (!self.songsDB[songName]) {
			var framedSong = [];
			var currentSongOffset = 0;
			while(currentSongOffset < song.length){
				var frameHeader;
				var synced = false;
				try{
					while (~synced) {
						frameHeader = song.readUInt32BE(currentSongOffset++);
						synced = (frameHeader & SYNC_MASK) >> 20;
						var mp3 = (frameHeader & MP3_SIGNATURE) >> 17;
						if (mp3 != 5) synced = false;
					}
				} catch(e){
					// Out of Bounds Error: sync not found in whole file
					// so trying with next one

					// Maybe last frame is not synced and when trying to read it, it generates an OoBE
					// but the whole song has been read correctly. Checking it here.
					if ( currentSongOffset + 2 < song.length) {
						console.log("Cannot sync whole file, next one, please.\n", e)
						self.generateTrack()
						return; // Out from outer loop
					}
				}
				var hasPadding = (frameHeader & 0x0000200) >> 9;
				// Explain 417 here
				var frameSize = 417 + (hasPadding? 1 : 0);
				var frame;
				try{
					frame = song.slice(currentSongOffset - 1, currentSongOffset - 1 + frameSize);
					framedSong.push(frame);
					currentSongOffset += frameSize - 1;
				} catch(e) {
					// Out of Bounds Error: it was the 
                    // last frame in file, so finished
					break;
				}
			}
			self.songsDB[songName] = framedSong;
			self.generateTrack();
			return;
		}
	})
}

Mp3Library.prototype.getPlaylist = function(){
	return this.playlist;
}

Mp3Library.prototype.getFrameFromTrack = function(frameNumber, trackNumber){
	return this.songsDB[ this.playlist[trackNumber] ][frameNumber];
}

module.exports = exports.Mp3Library = Mp3Library;
