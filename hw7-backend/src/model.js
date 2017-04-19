// this is model.js 
var mongoose = require('mongoose')
require('./db.js')

// The comment schema
var commentSchema = new mongoose.Schema({
	commentId: String, author: String, date: Date, text: String
})

// The article schema
var articleSchema = new mongoose.Schema({
	id: Number, author: String, img: String, date: Date, text: String,
	comments: [ commentSchema ]
})

// The profile schema
var profileSchema = new mongoose.Schema({
	username: String, dob: Date, email: String, zipcode: String, avatar: String, following: [String], headline: String
})

// The user schema
var userSchema = new mongoose.Schema({
	username: String, salt: String, hash: String
})

exports.Article = mongoose.model('article', articleSchema)
exports.Profile = mongoose.model('profile', profileSchema)
exports.User = mongoose.model('user', userSchema)
exports.Comment = mongoose.model('comment', commentSchema)

