var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/whizr');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var whizrSchema = new Schema({
	name		:	String,
	username	:	String,
	password	:	String,
	email		:	String,
	emailHash	:	String,
	following	:	[String]
});

var whizSchema = new Schema({
	text	:	{ type:String },
	author	:	{ type:String },
	date	:	{ type:Date, default: Date.now }
});

exports.Whizr = mongoose.model('Whizr', whizrSchema);
exports.Whiz = mongoose.model('Whiz', whizSchema);
