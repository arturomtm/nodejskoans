var express = require('express'),
	crypto = require('crypto');

var models = require('./models/whizr.js');

var app = express();

app.engine('.html', require('ejs').__express);
app.set('view engine', 'ejs');

app.configure(function(){
	app.use(express.favicon()); // avoid call twice the routes
	app.use(express.static(__dirname + '/public'));
	app.use(express.cookieParser());
	app.use(express.session({ secret: "Node.js koans" }));
	app.use(express.bodyParser()); // to parse post params
});

/**********************
	INDEX & PROFILE   *
***********************/

app.get('/', function(req, res){
	res.sendfile('./views/index.html');
});

app.get('/:username', function(req, res){

	var username = req.params('username');

	models.Whizr.findOne({ username: username }, function(err, doc){

		if (err || doc == null) {
			res.send('Not found', 404);
            return;
		}
		
		models.Whiz.find( { author: username }, function(err, docs){
			if (err || doc == null) {
				res.send('Not found', 404);
			}
            res.render('home.html', {  name: doc.name, username: doc.username, whizs: docs, whizr: req.session.whizr } );
		} ).sort({ date: -1 });
		
	});
});

app.get('/:username/profilepic', function(req, res){
	models.Whizr.findOne({ username: req.params.username }, function(err, doc){

		if(err){
            res.send('Not Found', 404);
        };
		
		res.redirect("http://www.gravatar.com/avatar/" + doc.emailHash + "?s=100");
	});
});

/******************************
	REGISTER & LOGIN & LOGOUT *
*******************************/

app.post('/login', function(req, res){

	//In case we're logged in
	if (req.session.whizr != undefined) {
		res.redirect('/' + req.session.whizr.username);
	}
	
	models.Whizr.findOne( { username: req.param('username') }, function(err, doc){
		if (err) {
			res.send('Error', 500);
		}

		if ( doc.password == req.param('password') ) {
			req.session.whizr = doc;
			res.redirect('/' + doc.username);
		} else {
			res.send('Unauthorized', 401);
		};		
	} )

});

// Filter to check authentication in routes that could need it
var checkAuth = function(req, res, next){
	req.session.whizr? next() : res.send('Unauthorized', 401);
}

app.post('/logout', checkAuth, function(req, res){
		var redirect = req.session.whizr.username;
		req.session.destroy();
		res.redirect('/' + redirect);
});

app.post('/register', function(req, res){
	var username = req.param('username');
	var password = req.param('password');
	var name = req.param('name');
	var email = req.param('email');

	if ( username.length <= 4 || username.length >= 10 ||  password.length <= 4 || password.length >= 10) {
		res.redirect('/'); // error
        return;
	}
	
	models.Whizr.findOne({ username: username }, function(err, doc){
	
		if (err) {
			res.send('Error', 500);
            return;
		}
		
		if (doc != null) {
			//error, nombre ocupado
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
                return;
			}
            req.session.whizr = whizr;
   			res.redirect('/' + username);
		});
	});
});


/*************
	WHIZEAR  *
**************/

app.post('/whizr', checkAuth, function(req, res){
	var text = req.param('whiz');
	
	if ( text == null || text.length  == 0 || text.length >= 140) {
		//send error PERO ESTE N0!
		res.redirect('Error', 404);
        return;
	}
	
	var whiz = new models.Whiz();
	
	whiz.text = text;
	whiz.author = req.session.whizr.username;
			
	whiz.save(function(err){

		if (err) {
            res.send("Error", 500);
            return;
        }

		res.redirect('/' + req.session.whizr.username);

	});
});



/**********************
 	FOLLOW & UNFOLLOW *
***********************/

app.post('/follow', checkAuth, function(req, res){
	var followTo = req.param('username');
	
	if (followTo.length == 0 || followTo == null || followTo == req.session.whizr.username){
		//send error
        return;
	}

	models.Whizr.update( {username: req.session.whizr.username}, { $addToSet: { following: followTo } }, null, function(err, numAffected){
		if (!err) {
			req.session.whizr.following.push(followTo);
			console.log(req.session.whizr.following);
			res.redirect('/' + followTo);
		}
	});
});

app.post('/unfollow', checkAuth, function(req, res){

	var unfollow = req.param('username');
	
	if (unfollow.length == 0 || unfollow == null || unfollow == whizr){
		//send error
        return;
	}

	models.Whizr.update( {username: req.session.whizr.username }, { $pull: { following: unfollow } }, null, function(err, numAffected){
		if (!err) {
			// updates the session avoiding query
            // the database to update session data
			var following = req.session.whizr.following;
			following.splice(following.indexOf(unfollow), 1);			
			res.redirect('/' + unfollow);
		}
	});
});


module.exports = exports = app;

// To ignore: for testing purposes
app.get('/:username/following', function(req, res){
    models.Whizr.findOne({username: req.param('username')}, function(err, doc){
		if(err){
            res.send('Not Found', 404);
        };
        res.send(200, { following: doc.following});
    });
});
