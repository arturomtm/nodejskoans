var dgram = require('dgram'),
    koanize = require('koanizer');

koanize(this);

var Sender = function(options){

	var options = options || {}

	this.port = options.port || 5000;
	this.broadcastAddress = options.broadcastAddress || '224.0.0.14';

    console.log("Broadcasting in", this.broadcastAddress, "port", this.port);
	
    this.stats = {
        txPackets : 0,
        txBytes : 0
    };
/*
    KOAN #1
    should create udp sockets properly
*/
    this.txSocket = dgram.___('udp4');
    this.rxSocket = dgram.___('udp4');
};

Sender.prototype.start = function(){
/*
    KOAN #2
    should make udp server listening sucessfully
*/
    this.rxSocket.___(5001);
};

Sender.prototype.broadcast = function(packet){

    var self = this;

/*
    KOAN #3
    should send a message correctly
*/    
    this.txSocket.send(packet, 0, packet.length, this.port, this.broadcastAddress, function(err, bytes){
        ++self.stats.txPackets;
        self.stats.txBytes += bytes;
    });
};

Sender.prototype.enableStats = function(enable){

    var self = this;

    if (enable){
/*
    KOAN #4
    should attend incoming packets from clients
*/
        this.rxSocket.on(___, function(msg, rinfo){
            var stats = new Buffer(JSON.stringify(self.stats));
/*
    KOAN #5
    should response to clients with stats messages
*/
            dgram.createSocket('udp4').send(stats, 0, stats.length, 5002, rinfo.___);
        })
    }else{
        this.rxSocket.removeAllListeners();
    }

};

Sender.prototype.end = function(){
    this.rxSocket.close();
    this.txSocket.close();
}

exports.Sender = Sender;

