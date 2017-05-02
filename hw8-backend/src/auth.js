const md5 = require('md5')
const cookieParser = require('cookie-parser')
const request = require('request')
const qs = require('querystring')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const config = {
    clientID: '120292378458716', 
    clientSecret: '47afb5ca631ccad80068d32069cb6be4', 
    callbackURL: 'https://comp531fullwebapp.herokuapp.com/auth/callback'
}

if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = 'redis://h:pcd213f25e3bfaa5a9e7ec2ff2262ce1d38cbb6c3122d1025283a06cbad733bac@ec2-34-206-56-5.compute-1.amazonaws.com:40069'
}
const redis = require('redis').createClient('redis://h:pcd213f25e3bfaa5a9e7ec2ff2262ce1d38cbb6c3122d1025283a06cbad733bac@ec2-34-206-56-5.compute-1.amazonaws.com:40069')
const User = require('./model').User
const Profile = require('./model').Profile
const Article = require('./model').Article
const Comment = require('./model').Comment
const cookieKey = 'sid'

// serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id)
})

// deserialize the user from the session
passport.deserializeUser(function(id, done) {
    User.findOne({ fbId: id }).exec(function(err, user) {
		done(null, user)
	}) 	
})

passport.use(new FacebookStrategy(config,
    function(token, refreshToken, profile, done) {
		const profileNameArray = profile.displayName.split(' ')
		const username = profileNameArray.join('') + "@facebook"
        User.findOne({ username: username }).exec(function(err, foundUser) {
            if (!foundUser) {
                new User({ username: username, fbId: profile.id }).save()
                new Profile({ username: username, zipcode: '77005', avatar: null, dob: "07-10-1990", following: [], headline: 'Happy' }).save()
            }
            process.nextTick(function() {
                return done(null, profile)
            })                       
        })
    }))

// The function to register for a new user
const Register = (req, res) => {
    const username = req.body.username
    const dob = new Date(req.body.dob)
    const email = req.body.email
    const zipcode = req.body.zipcode
    const password = req.body.password

    if (!req.body.username || !req.body.password) {
        return res.status(400).send({registerInfo: 'No username and password!'})
    }

    User.find({ username: username }).exec(function(err, items) {
        if (items && items.length > 0) {
            return res.status(401).send({registerInfo: 'User already exists!'})
        }
        const salt = username + new Date().getTime()
        const hash = md5(password + salt)
        new User({ username: username, salt: salt, hash: hash }).save()
        new Profile({ username: username, dob: dob, email: email, zipcode: zipcode, 
            avatar: null, following: [], headline: '' }).save()
        return res.status(200).send({
            username: req.body.username,
            status: 'success'
        })
    })
}

// Function to login
const Login = (req, res) => {
    const username = req.body.username

    const password = req.body.password

    if (!username || !password) {
        return res.status(400).send('Input username and password!')
    }

    User.find({ username: username }).exec(function(err, items) {
        if(items == null || items.length == 0) {
            return res.status(401).send('Unauthorized!')
        }
        const userObj = items[0]
        if (!userObj || userObj.hash !== md5(password + userObj.salt)) {
            return res.status(401).send('Unauthorized!')
        } else {
            const sessionId = md5(new Date().getTime() * Math.random() + username)

            redis.hmset(sessionId, userObj)
            res.cookie(cookieKey, sessionId, {maxAge: 3600*1000, httpOnly: true})
            
            const msg = {username: username, result: 'success'}
            res.send(msg)
        }
    })
}   

// isLoggedIn middleware
const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
        User.findOne({auth: {'facebook': req.user.username}}).exec(function(err, user) {
            if (!user) {
                req.username = req.user.username
            }
            else {
                req.username = user.username
            }
            next()
        })		
	}

    else if (!req.cookies[cookieKey]) {
        return res.status(401).send('Cookie not exist!')
    } else {
        redis.hgetall(req.cookies[cookieKey], function(err, userObj) {
            if (userObj) {
                req.username = userObj.username
                next()
            } else {
                return res.status(401).send()
            }
        })
    }
}

// Function to logout
const Logout = (req, res) => {
	if (req.isAuthenticated()) {
		req.session.destroy()
		req.logout()
		return res.status(200).send('OK')
	} else {
		req.logout()
		redis.del(req.cookies[cookieKey])
		res.clearCookie(cookieKey)
		return res.status(200).send('OK')
	}
}

const fail = (req, res) => {
    res.send('failed to login')
}

const profile = (req, res) => {
    res.send('ok now what?', req.user)
}

// Function to update password
const updatePassword = (req, res) => {
    const username = req.username
    const password = req.body.password
    if (!password) {
        return res.status(400).send("No password found!")
    }
    const salt = username + new Date().getTime()
    const hash = md5(password + salt)
    User.update({username: username}, {$set: {salt: salt, hash: hash}}, {new: true}, function(err, items) {
        return res.status(200).send('Password Updated!')
    })
}

// The function to link the facebook account to the regular account
const linkToRegular = (req, res) => {
    const username = req.body.inputUser
    const password = req.body.inputPass
    if (!username || !password) {
        return res.status(400).send()
    }
    User.findOne({username: username}).exec(function(err, foundUser) {
        if (!foundUser || foundUser.hash != md5(password + foundUser.salt)) {
            return res.status(400).send("Wrong Link!")
        }
        User.update({username: username}, {$addToSet: {'auth': {'facebook': req.username}}}, function(){})
        Profile.findOne({username: username}).exec(function(err, profileItem) {
            Profile.findOne({username: req.username}).exec(function(err, fbProfile) {
                let regularFollowing = profileItem.following
                if (fbProfile && fbProfile.following && fbProfile.following.length > 0) {
                    fbProfile.following.map(eachUser => {
                        if (regularFollowing.indexOf(eachUser) < 0) {
                            regularFollowing.push(eachUser)
                        }
                    })
                }
                Profile.update({username: username}, {$set: {'following': regularFollowing}}, function(){})
            })
        })
        Comment.update({author: req.username}, {$set: {'author': username}}, { new: true, multi: true }, function(){})
        Article.update({author: req.username}, {$set: {'author': username}}, { new: true, multi: true }, function(){})
        Article.update({'comments.author' : req.username}, { $set: {'comments.$.author': username}}, { new: true, multi: true }, function(){}) 
        return res.status(200).send("success")  
    })
}

// The function to unlink facebook account with regular account
const unlinkRegular = (req, res) => {
	const username = req.username
	User.findOne({username: username}).exec(function(err, user){
		if(user.auth.length !== 0){
			User.update({username: username}, {$set: {auth: []}}, {new: true}, function(){
				return res.status(200).send({linkInfo: 'unlink facebook success'})
			})
		} else {
			return res.status(400).send({linkInfo: "no link account"})
		}
	})
}

module.exports = app => {
    app.use(cookieParser())
    app.use(session({ secret: 'thisismysecretMessageyoucannotguessit' })) 
    app.post('/login', Login)
    app.post('/register', Register)
    app.use(passport.initialize())
    app.use(passport.session())
    app.use('/login/facebook', passport.authenticate('facebook', {scope: 'email'}))
    app.use('/auth/callback', passport.authenticate('facebook', {successRedirect: 'http://jamesqifullwebapp.surge.sh', failureRedirect:'/login/facebook'}))
    app.use(isLoggedIn)
    app.post('/linkregular', linkToRegular)
    app.get('/unlinkregular', unlinkRegular)
    app.put('/logout', Logout)
    app.put('/password', updatePassword)
	app.use('/profile', profile)
}
