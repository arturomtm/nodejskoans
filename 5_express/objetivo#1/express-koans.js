var express = require('express'),
	crypto = require('crypto');

var models = require('./models/whizr.js');

var app = express();

app.engine('.html', require('ejs').__express);
app.set('view engine', 'ejs');

app.configure(function(){
    /*
        KOAN #1
        The Application must be properly configured to serve favicon
    */
	app.___(express.favicon()); // avoid call twice the routes
	app.use(express.static(__dirname + '/public'));
	app.use(express.cookieParser());
	app.use(express.session({ secret: "Node.js koans" }));
	app.use(express.bodyParser()); // to parse post params
});

/**********************
	PROFILE & HOME    *
***********************/

/*
    KOAN #2
    Application must handle index page
*/
app.___('/', function(req, res){
	res.sendfile('./views/index.html');
});

app.get('/:username', function(req, res){
	var username = req.param('username');
	models.Whizr.findOne({ username: username }, function(err, doc){
		if (err || doc == null) {
            /*
                KOAN #3
                Application must be able to generate simple responses
            */
			res.___(404, 'Not found');
		} else {
            /*
                KOAN #4
                Application must be able to produce dynamic responses according to a view
            */
		    res.___('home.html', {  name: doc.name, username: doc.username, whizr: req.session.whizr } )
        }
	});
});

app.get('/:username/profilepic', function(req, res){
	models.Whizr.findOne({ username: req.params.username }, function(err, doc){
		if(err){
            res.send('Not Found', 404);   
        } else {
    		res.redirect("http://www.gravatar.com/avatar/" + doc.emailHash + "?s=100");
        }
	});
});

/******************************
	REGISTER & LOGIN & LOGOUT *
*******************************/

/*
    KOAN #5
    Application must handle action endpoints for forms
*/
app.___('/login', function(req, res){

	//In case we're logged in
	if (req.session.whizr != undefined) {
		res.redirect('/' + req.session.whizr.username);
	}
	
	models.Whizr.findOne( { username: req.param('username') }, function(err, doc){
		if (err) {
			res.send('Error', 500);
            return;
		}

		if ( doc.password == req.param('password') ) {
			req.session.whizr = doc;
			res.redirect('/' + doc.username);
		} else {
			res.send('Unauthorized', 401);
		};		
	} )

});

app.post('/logout', function(req, res){
	if (req.session.whizr) {
		var redirection = req.session.whizr.username;
		req.session.destroy();
		res.redirect('/' + redirection);
	} else {
		res.send('Unauthorized', 401);
	}
});

app.post('/register', function(req, res){
	var username = req.param('username');
	var password = req.param('password');
	var name = req.param('name');
	var email = req.param('email');

	if ( username.length <= 4 || username.length >= 10 ||  password.length <= 4 || password.length >= 10) {
		res.redirect(400, '/'); // error
        return;
	}

	models.Whizr.findOne({ username: username }, function(err, doc){
	
		if (err) {
			res.send('Error', 500);
            return;
		}
		
		if (doc != null) {
			//error, nombre ocupado
            res.send('Error', 500);
            return;
		}
		
		var whizr = new models.Whizr();
		
		whizr.name = name;
		whizr.username = username;
		whizr.password = password;
		whizr.email = email;
		var hash = crypto.createHash('md5');
		hash.update(email);
		whizr.emailHash = hash.digest('hex');
        whizr.newMentions = 0;
		
		whizr.save(function(err){
			if (err) {
    			res.send('Error', 500);
			};
            req.session.whizr = whizr;
			res.redirect('/' + username);
		});
	});
});

module.exports = exports = app;
