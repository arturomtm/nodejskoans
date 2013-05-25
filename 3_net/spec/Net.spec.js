var TcpServer = require('../net-koans'), 
    net = require('net');

describe("Koans suite for Node.js Net module", function(){

	it("Koan#1 should instantiate a TCP Server", function(){

    	var tcpserver1;

		runs(function(){
            tcpserver1  = TcpServer.create();
        });

        waitsFor(function(){
            return tcpserver1;
        }, "the Server to be created", 100);

        runs(function(){
            tcpserver1.getServer(function(server){
                expect(server).not.toBeUndefined();
            });
        });
	});
	
	it("Koan#2 should be able to listen to incoming connections", function(){
		var listening = false;
		
		runs(function(){
			var tcpserver2 = TcpServer.create().onListening(function(){
				listening = true;
                this.close();
			}).listen(5552);
		});

		waitsFor(function(){
			return listening;
		}, "the Server to be listening", 100);
		
		runs(function(){
			expect(listening).toBe(true);
		});
		
	});
	
	it("Koan#3 should attend incoming connections", function(){
	
		var connected = false;

		runs(function(){
			var tcpserver3 = TcpServer.create().onListening(function(){
                var server = this;
				var client = net.createConnection(5553);
				client.on('connect', function(){
					connected = true;
					this.on('close', function(){
						server.close();
					});
					this.end();
				});
			}).listen(5553);		
		});
		
		waitsFor(function(){
			return connected;
		}, "the Server to accept connection", 100);
		
		runs(function(){
			expect(connected).toBe(true);
		});

	});

	it("Koan#4 should write in connection socket", function(){
		var message;
		
		runs(function(){
			var tcpserver4 = TcpServer.create().onListening(function(){
                var server = this;
				var client = net.createConnection(5554);
				client.on('data', function(data){
					message = data.toString().split(',')[0];
					this.on('close', function(){
						server.close();
					});
					this.end();
				});
			}).listen(5554);		
		});
		
		waitsFor(function(){
			return message;
		}, "the Server to send something", 100);
		
		runs(function(){
			expect(message).toBe("Welcome to your command line playlist manager");
		});	
	});
	
	it("Koan#5 should be able to close connections", function(){
		var closed = false;
		
		runs(function(){
			var tcpserver5 = TcpServer.create().onListening(function(){
                var server = this;
				var client = net.createConnection(5555);
				client.on('connect', function(){
					var clientB = net.createConnection(5555);
					clientB.on('close', function(){
						closed = true;
						this.end();
						client.end();
						server.close();
					});
				});
			}).listen(5555);		
		});
		
		waitsFor(function(){
			return closed;
		}, "the Server to close the connection", 100);
		
		runs(function(){
			expect(closed).toBe(true);
		});	
	});
	

	// To test this Koan is needed that songs directory was empty:
    // Timeout triggers 10 senconds after last song played
	xit("Koan#6 should trigger a inactivity timeout on the socket", function(){
		var closed = false;
		
		runs(function(){
			var tcpserver6 = TcpServer.create().onListening(function(){
                var server = this;
				var client = net.createConnection(5556);
                client.on('close', function(){
                    closed = true;
                    server.close();
                });
                client.on('data', function(d){ console.log(d.toString())});
				client.on('connect', function(){
                    this.write("play\r\n");
				});
			}).listen(5556);		
		});
		
		waitsFor(function(){
			return closed;
		}, "the Server to timeout", 2 * 100);
		
		runs(function(){
			expect(closed).toBe(true);
		});

	});
	
	it("Koan#7 should receive incoming data from connections", function(){
		var response;
		
		runs(function(){
			var tcpserver7 = TcpServer.create().onListening(function(){
                var server = this;
				var client = net.createConnection(5557);
                client.on('data', function(data){
                    response = data.toString().split('# ')[1];
                });
				client.on('connect', function(){
                    this.write("exit\r\n");
				});
                client.on('close', function(){
                    server.close();
                });
			}).listen(5557);		
		});
		
		waitsFor(function(){
			return response;
		}, "the Server to accept some data", 100);
		
		runs(function(){
			expect(response).toBe("Bye.");
		});	
    });

});
