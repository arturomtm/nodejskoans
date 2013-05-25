var RTPProtocol = require('./buffer-koans'),
    udp = require('./dgram-koans'),
    nodeMp3 = require('NMp3');

var library = new nodeMp3.Mp3Library({ basedir: '../data/songs/' });

library.on("ready", function(){

    var mp3source = new nodeMp3.Mp3Source(library);
    var rtpprotocol = new RTPProtocol();
    var udpsender = new udp.Sender();
    udpsender.enableStats(true);

    mp3source.on('track', function(){
        rtpprotocol.setMarker = true;
    });
    mp3source.on('frame', function(frame){
        rtpprotocol.pack(frame);
    });

    rtpprotocol.on('packet', function(packet){
        udpsender.broadcast(packet);
    });

    udpsender.start();

});
