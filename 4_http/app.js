var	RTPProtocol = require('simpleRTP'),
	listHttpServer = require('./http-koans'),
	udp = require('dgram'),
    nodeMp3 = require('NMp3');

var PORT = 8080;
var GROUP = "224.0.0.114";

var library = new nodeMp3.Mp3Library({ basedir: '../data/songs/' });
var rtpservers = [];
var sessionsDB = {};
var listServer = listHttpServer.create(sessionsDB);
var udpSocket = udp.createSocket('udp4');

library.on("ready", function(trackList){

	var source = new nodeMp3.Mp3Source(library);
	sessionsDB["224.0.0.114"] = source;

	var rtpprotocol = new RTPProtocol();

    source.on('frame', function(frame){
        rtpprotocol.pack(frame);
    });

	rtpprotocol.on('packet', function(packet){
		udpSocket.send(packet, 0, packet.length, 5002, GROUP);
	});
	
	listServer.listen(PORT, function(){
        console.log("Listening in...", PORT);
        console.log("Sessions for", GROUP);
    });
});
