var http = require('http'), 
	url = require('url'), 
	fs = require('fs'), 
	querystring = require('querystring');

var listServer = http.createServer();
/*
    KOAN #1
    should make the server to response incoming requests
*/
listServer.on(___, function(req, res){

	var self = this;
/*
    KOAN #2
    should make the server to properly read the requests headers
*/	
	var credentials = req.___["authorization"];
	var userAndPass, broadcastIp, pass;
	if (credentials){
		userAndPass = new Buffer(credentials.split(' ')[1], 'base64').toString('ascii').split(':');
		broadcastIp = userAndPass[0];
		pass = userAndPass[1];
	}
	if (!credentials || !(broadcastIp in allowedList && broadcastIp in this.broadcastList) || allowedList[broadcastIp] != pass) {
		res.writeHead(401, "Unauthorized", {
			"WWW-Authenticate": 'Basic realm="List Server Authentication"'
		});
		res.end();
		return;
	}
/*
    KOAN #3
    should make the server to use url module
*/	
	var uri = url.___(req.url);
/*
    KOAN #4
    should make the server to identify the request method
*/
	switch(req.___){
		case 'GET':
			var path = uri.pathname;
			if ( path == '/' ){
                var player = this.broadcastList[broadcastIp];
                writeDocument(res, {group:broadcastIp, paused:player.paused, tracks:player.list(), currentTrack:player.currentTrack()});
			} else {
				fs.readFile("." + path, function(error, data){
					if (error){
						res.writeHead(404);
						res.end();
						return;
					}
					
					var fileExtension = path.substr(path.lastIndexOf(".") + 1);
					var mimeType = MIME_TYPES[fileExtension];
/*
    KOAN #5
    should make the server to include new header in implicit requests
*/
					res.___("Content-Type", mimeType);
					if (mimeType.indexOf("text/") >= 0){
						res.setHeader("Content-Encoding", "utf-8");
					}
					res.setHeader("Content-Length", data.length);
					res.write(data, "binary");
					res.end();
				});
			}
			break;
		
		case 'POST':
			req.setEncoding('utf8');
			
			var body = '';
			req.on('data', function(data){
				body += data;
			})
			
			req.on('end', function(){
/*
    KOAN #6
    should make the server to use querystring module
*/
				var query = querystring.___(body);
				var action = query.action;
				
				var player = self.broadcastList[broadcastIp];
				if (action in player) {
					player[action](function(){
                        writeDocument(res, {group:broadcastIp, paused:player.paused, tracks:player.list(), currentTrack:player.currentTrack()});
					});
				} else {
                    res.writeHead(500, "Internal Server Error");
                    res.end();
                }
			});
			break;
		
		default:
			res.writeHead(501, "Not Implemented");
			res.end();
			break;
	}
});

var writeDocument = function(res, doc){
	var head = '<html><head><link rel="stylesheet" type="text/css" href="/static/style.css"></head><body>';
	var tail = '</body></html>';
    var info = '<p>Playlist for group ' + doc.group + '</p>';
	var form = '<form method="post" action="/">';
		form += '<input type="submit" value="prev" name="action">';
		form += doc.paused? '<input type="submit" value="play" name="action">' : '<input type="submit" value="pause" name="action">';
		form += '<input type="submit" value="next" name="action"></form>';
	
	var trackList = doc.tracks;
	
	var list = "<ul>";
	for(var i=0, l=trackList.length; i<l; i++){
		var track = trackList[i];
		list += ('<li' + (track == doc.currentTrack? ' class="currentTrack"' : '') + '>' + track + '</li>');
	};
	list += "</ul>";
	
	var content = head + info + form + list + tail;
	res.writeHead(200, 'OK', {
		"Content-type": "text/html",
		"Content-length" : content.length
	});
	res.write(content);
	res.end();
}

var allowedList = {
	"224.0.0.114": "password"
}

var MIME_TYPES = {
	"png" : "image/png",
	"css" : "text/css",
	"js" : "text/javascript",
	"html" : "text/html"
}

exports.create = function(db){
	if (db == null) throw new Error('Database cannot be empty');
	
	listServer.broadcastList = db;
	return listServer;
}
