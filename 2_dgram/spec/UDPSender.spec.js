var dgram = require('dgram'), 
    udps = require('../dgram-koans.js');

describe("Koans suite for Node.js Dgram module", function(){
    
	var PORT_CLIENT_MESSAGES = 5000;//2467;
	var PORT_SERVER_MESSAGES = 5001;//7531;
    var PORT_CLIENT_STATS = 5002;//2468;
    var FOO_MSG = 'foo';
		
    it("Koan#1 should create udp sockets properly", function(){
        var udpsender;

        try{
            udpsender = new udps.Sender();
        } catch(e){
        }

        expect(udpsender.txSocket instanceof dgram.Socket).toBeTruthy();
        expect(udpsender.rxSocket instanceof dgram.Socket).toBeTruthy();
    });

    it("Koan#2 should make udp server listening sucessfully", function(){
		
		var sender, listening = false;
		
		runs(function(){
			sender = new udps.Sender({ broadcastAddress : '127.0.0.1' });
			sender.rxSocket.on('listening', function(){
				listening = true;
			});
			sender.start();
		})

        waitsFor(function(){
            return listening;
        }, "the Koan#2 to be completed", 100);

		runs(function(){
			expect(listening).toBeTruthy();
			sender.end();
		});
    });

    it("Koan#3 should send a message correctly", function(){

		var MESSAGE = 'message';
		var client, sender, msg;
		
		runs(function(){
			client = dgram.createSocket('udp4');
			client.on('listening', function(){
				sender = new udps.Sender({ broadcastAddress : '127.0.0.1' });
                sender.broadcast(new Buffer(MESSAGE));
			});
			client.on('message', function(m, rinfo){
				msg = m.toString();
				this.close();
			});
			client.on('close', function(){
				
			});
			client.bind(PORT_CLIENT_MESSAGES);
		});
		
		waitsFor(function(){
			return msg;
		}, "the Koan#3 to complete", 100);
		
		runs(function(){
			expect(msg).toEqual(MESSAGE);
			sender.end();
		});
	
	});

    it("Koan#4 should attend incoming packets from clients", function(){
		var sender = new udps.Sender();
		sender.enableStats(true);
		var listeners = sender.rxSocket.listeners('message')
		
		expect(listeners.length).toBe(1);
        sender.end();
	});
	
    it("Koan#5 should response to clients with stats messages", function(){
	
		var client, sender, stats;
		
		runs(function(){
			client = dgram.createSocket('udp4');
			client.on('listening', function(){
				sender = new udps.Sender({ broadcastAddress : '127.0.0.1' });
				sender.enableStats(true);
				sender.rxSocket.on('listening', function(){
					sender.broadcast(new Buffer(FOO_MSG));
					sender.broadcast(new Buffer(FOO_MSG));
					client.send(new Buffer('foo', 'ascii'), 0, 3, PORT_SERVER_MESSAGES, '127.0.0.1');
				});
				sender.start();
			});
			client.on('message', function(msg, rinfo){
				stats = JSON.parse(msg.toString());
			});
			client.bind(PORT_CLIENT_STATS);
		});
		
		waitsFor(function(){
			return stats;
		}, "the Koan#5 to complete", 100);
		
		runs(function(){
            expect(stats.txPackets).toBe(2);
            expect(stats.txBytes).toBe(2 * FOO_MSG.length);
			sender.end();
            client.close();
		});
		
    });

    xit("", function(){});
});
