var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/whizr');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var whizrSchema = new Schema({
	name		:	String,
	username	:	String,
	password	:	String,
	email		:	String,
	emailHash	:	String
});

exports.Whizr = mongoose.model('Whizr', whizrSchema);
