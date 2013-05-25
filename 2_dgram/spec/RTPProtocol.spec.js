var RTPProtocol = require('../buffer-koans');

describe("Koans suite for Node.js Buffer module", function(){

    var rtpserver = new RTPProtocol();
    
    it("Koan#1 should write Version, Padding, Extension and Count", function(){

        rtpserver.on('packet', function(packet){
            expect(packet.readUInt8(0)).toBe(128);
            rtpserver.removeAllListeners();
        });

        rtpserver.pack(new Buffer("koan1"));
    });

    it("Koan#2 should write Sequence Number", function(){

        rtpserver.on('packet', function(packet){
            expect(packet.readUInt16BE(2)).toBe(rtpserver.seqNum);
            rtpserver.removeAllListeners();
        });

        rtpserver.pack(new Buffer("koan2"));
    });

    it("Koan#3 should write Timestamp, SSRC and Payload Format", function(){

        rtpserver.on('packet', function(packet){
            expect(packet.readUInt32BE(4)).toBe(rtpserver.timestamp);
            expect(packet.readUInt32BE(8)).toBe(rtpserver.ssrc);
            expect(packet.readUInt32BE(12)).toBe(0);
            rtpserver.removeAllListeners();
        });

        rtpserver.pack(new Buffer("koan3"));
    });
});
