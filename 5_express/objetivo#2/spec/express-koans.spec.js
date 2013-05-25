var http = require('http'), app = require('../express-koans');

describe("", function(){

    var code = null;

	afterEach(function(){
		code = null;
	});

    it("Koan#1 should make the application to have a authentication middleware", function(){
        runs(function(){
            var server = http.createServer(app).listen(8080, function(){
                var req = http.request({host:"127.0.0.1", port:8080, method:"POST",path:"/register"}, function(res){
                    if (res.statusCode == 302 || res.statusCode == 500){
                        var req = http.request({host:"127.0.0.1", port:8080, method:"POST",path:"/whizr"}, function(res){
                            code = res.statusCode;
                            server.close();
                        });
                        var query = "whiz=testing%20koan%20number%20one";
                        req.setHeader("Content-Length", query.length);
                        req.setHeader("Content-type", "application/x-www-form-urlencoded");
                        req.write(query+"\n");
                        req.end();
                    }  
                });
                var query = "username=mengano&password=12345&name=Mengano&email=mengano@adios.tu";
                req.setHeader("Content-Length", query.length);
                req.setHeader("Content-type", "application/x-www-form-urlencoded");
                req.write(query+"\n");
                req.end();
            });
        });

		waitsFor(function(){
			return code;
		}, "the Koan#1 to be completed", 100);
		
		runs(function(){
			expect(code).toEqual(302);
		});
    });

    it("Koan#2 should make the application to update the database", function(){
        runs(function(){
            var server = http.createServer(app).listen(8080, function(){
                var req = http.request({host:"127.0.0.1", port:8080, method:"POST",path:"/register"}, function(res){
                    if (res.statusCode == 302 || res.statusCode == 500){
                        http.get("http://127.0.0.1:8080/menganito", function(res){
                            code = res.statusCode;
                            server.close();
                        });
                    }  
                });
                var query = "username=menganito&password=12345&name=Menganito&email=mengano@hola.tu";
                req.setHeader("Content-Length", query.length);
                req.setHeader("Content-type", "application/x-www-form-urlencoded");
                req.write(query+"\n");
                req.end();
            });
        });

		waitsFor(function(){
			return code;
		}, "the Koan#4 to be completed", 100);
		
		runs(function(){
			expect(code).toEqual(200);
		});
    });

    it("Koan#3 should make the Application to handle action endpoints for forms", function(){
        runs(function(){
            var server = http.createServer(app).listen(8080, function(){
                var req = http.request({host:"127.0.0.1", port:8080, method:"POST",path:"/login"}, function(res){
                    code = res.statusCode;
                    server.close();
                });
                var query = "username=menganito&password=12345";
                req.setHeader("Content-Length", query.length);
                req.setHeader("Content-type", "application/x-www-form-urlencoded");
                req.write(query+"\n");
                req.end();
            });
        });

		waitsFor(function(){
			return code;
		}, "the Koan#5 to be completed", 100);
		
		runs(function(){
			expect(code).toEqual(302);
		});
    });
});
