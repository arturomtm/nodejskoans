var events = require('events'),
	util = require('util');

// Standard and RFC set these values
var REFERENCE_CLOCK_FREQUENCY = 90000;

// RTP packet constants and masks
var RTP_HEADER_SIZE = 12;
var RTP_FRAGMENTATION_HEADER_SIZE = 4;

var SAMPLES_PER_FRAME = 1152; // ISO 11172-3
var SAMPLING_FREQUENCY = 44100;
// esta debe integrarse con la source de alguna manera
var TIMESTAMP_DELTA = Math.floor(SAMPLES_PER_FRAME * REFERENCE_CLOCK_FREQUENCY / SAMPLING_FREQUENCY);
var SECONDS_PER_FRAME = SAMPLES_PER_FRAME / SAMPLING_FREQUENCY;

var RTPProtocol = function(){
	events.EventEmitter.call(this);

	this.setMarker = false;
	this.ssrc = Math.floor(Math.random() * 100000);
	this.seqNum = Math.floor(Math.random() * 1000);
	this.timestamp = Math.floor(Math.random() * 1000);
};
util.inherits(RTPProtocol, events.EventEmitter);

RTPProtocol.prototype.pack = function(payload){

		++this.seqNum;
		
		// RFC3550 says it must increase by the number of samples 
		// sent in a block in case of CBR audio streaming
		this.timestamp += TIMESTAMP_DELTA;

		if (!payload) {
			// Tried to send a packet, but packet was not ready. 
			// Timestamp and Sequence Number should be increased 
			// anyway 'cause interval callback was called and 
			// that's like sending silence
			this.setMarker = true;
			return;
		}
		
		var RTPPacket = new Buffer(RTP_HEADER_SIZE + RTP_FRAGMENTATION_HEADER_SIZE + payload.length);
		
		// version = 2:        10
		// padding = 0:          0
		// extension = 0:         0
		// CRSCCount = 0:          0000
		RTPPacket.writeUInt8(128, 0);
		
		// Marker = 0:                        0
		// RFC 1890: RTP Profile for Audio and Video Conferences with Minimal Control
		// Payload = 14: (MPEG Audio Only)     0001110
		RTPPacket.writeUInt8(this.setMarker? 142 : 14, 1);
		this.setMarker = false;
		
		// SequenceNumber
		RTPPacket.writeUInt16BE(this.seqNum, 2);
		
		// Timestamp
		RTPPacket.writeUInt32BE(this.timestamp, 4);
		
		// SSRC
		RTPPacket.writeUInt32BE(this.ssrc, 8);
		
		// RFC 2250: RTP Payload Format for MPEG1/MPEG2 Video
		// 3.5 MPEG Audio-specific header
		RTPPacket.writeUInt32BE(0, 12);

		payload.copy(RTPPacket, 16);
		
		this.emit('packet', RTPPacket);
		//return RTPPacket;
};

module.exports = exports.RTPProtocol = RTPProtocol;
