var http = require('http'), 
	listHttpServer = require('../http-koans'), 
	mp3 = require('./Mp3SourceStub');

describe("Koans suite for Node.js HTTP module",function(){

	var PORT = 5556;
	var database = { "224.0.0.114" : new mp3.Mp3Source() };

	var code = null;
	
	afterEach(function(){
		code = null;
	});
	
	it("Koan#1 should make the server to response incoming requests", function(){
		
		runs(function(){
			var server = listHttpServer.create(database).listen(PORT, "127.0.0.1");
			server.on('listening', function(){
				var client = http.request({
						host : "127.0.0.1", 
						port : 5556}, 
					function(res){
						code = res.statusCode;
					});
				client.end();
			});
		});
		
		waitsFor(function(){
			return code;
		}, "the Koan#1 to be completed", 100);
		
		runs(function(){
			expect(code).toEqual(401);
		});
	});

	it("Koan#2 should make the server to properly read the requests headers", function(){
		
		runs(function(){
			var server = listHttpServer.create(database).listen(PORT, "127.0.0.1");
			server.on('listening', function(){
				var client = http.request({host : "127.0.0.1", port : 5556, auth : '224.0.0.114:password'}, function(res){
					code = res.statusCode;
				});
				client.end();
			});
		
		});
		
		waitsFor(function(){
			return code;
		}, "the Koan#2 to be completed", 100);
		
		//Si proporcionando las credenciales correctas no autentica, es que no lee las cabeceras bien
		runs(function(){
			expect(code).not.toEqual(401);
		});
	});
	
	xit("Koan#3", function(){});
	
	it("Koan#3 should make the server to use url module", function(){
		
		runs(function(){
			var server = listHttpServer.create(database).listen(PORT, "127.0.0.1");
			server.on('listening', function(){
				var client = http.request({
						host : "127.0.0.1", 
						port : 5556, 
						method : "PUT", 
						auth : '224.0.0.114:password'}, 
					function(res){
						code = res.statusCode;
				});
				client.end();
			});
		
		});
		
		waitsFor(function(){
			return code;
		}, "the Koan#4 to be completed", 100);
		
		//Para este caso, si parsea la url debe devolver un codigo de respuesta 501, bien porque no se han completado koans posteriores o bien porque el server recibe PUT
		runs(function(){
			expect(code).toEqual(501);
		});
	});
	
	it("Koan#4 should make the server to identify the request method", function(){
		
		runs(function(){
			var server = listHttpServer.create(database).listen(PORT, "127.0.0.1");
			server.on('listening', function(){
				var client = http.request({
						host : "127.0.0.1", 
						port : 5556, 
						auth : '224.0.0.114:password'}, 
					function(res){
						code = res.statusCode;
					});
				client.end();
			});
		
		});
		
		waitsFor(function(){
			return code;
		}, "the Koan#5 to be completed", 100);
		
		//Ante una petición correcta, debe devolverse la página principal, de no saber el servidor qué metodo está recibiendo, devolvería un 501
		runs(function(){
			expect(code).toEqual(200);
		});
	});
	
	it("Koan#5 should make the server to include new header in implicit requests", function(){
		
		var contentType;
		var closed = false;
		runs(function(){
			var server = listHttpServer.create(database).listen(PORT, "127.0.0.1");
			server.on('listening', function(){
				
				var client = http.request({
						host : "127.0.0.1", 
						port : 5556, 
						path : "/static/style.css", 
						auth : '224.0.0.114:password'}, 
					function(res){
						contentType = res.headers["content-type"];
					});
					
				var cssSheet= '';
				client.on('data', function(data){
					cssSheet += data;
				});
				
				client.end();
			});
		
		});
		
		waitsFor(function(){
			return contentType;
		}, "the Koan#6 to be completed", 100);
		
		//Se debe incluir una de las cabeceras fijadas con setHeader, por ejemplo, content-type
		runs(function(){
			expect(contentType).toEqual("text/css");
		});
	});
	
	it("Koan#6 should make the server to use querystring module", function(){
		
		runs(function(){
			var server = listHttpServer.create(database).listen(PORT, "127.0.0.1");
			server.on('listening', function(){
				var client = http.request({
						host : "127.0.0.1", 
						port : 5556, 
						method : "POST", 
						auth : "224.0.0.114:password"}, 
					function(res){
						code = res.statusCode;
					});
				client.write("action=next", "utf8");
				client.on('end', function(){
					server.close();
					this.destroy();
				});
				client.end();
			});
		
		});
		
		waitsFor(function(){
			return code;
		}, "the Koan#7 to be completed", 100);
		
		//Enviando la accion correcta, debe devolver un 200 OK, de otra manera, no la parsea bien y se obtiene un 500
		runs(function(){
			expect(code).toEqual(200);
		});
	});

})
