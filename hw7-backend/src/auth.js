const md5 = require('md5')
const cookieParser = require('cookie-parser')
const request = require('request')
const qs = require('querystring')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const callbackURL = 'http://localhost:3000/auth/callback'
const clientSecret = '289018ac9e0a5ce9abc3ec28b9dce30e'
const clientID = '1477223485630797'
const config = {clientSecret, clientID, callbackURL}

// const redis = require('redis').createClient('redis://h:p03ee1ff96db0ed6c743178ef83ea7eeedaad7afc3142fc6efddf4f007416bd51@ec2-34-206-56-163.compute-1.amazonaws.com:27499')
const redis = require('redis').createClient('redis://h:p0639bacf214e7b5f4cf5f911d6bd22413665e1d0434574303022973a9b404099@ec2-34-204-242-91.compute-1.amazonaws.com:11349')
const User = require('./model').User
const Profile = require('./model').Profile
const cookieKey = 'sid'

let users = []
// serialize the user for the session
passport.serializeUser(function(user, done) {
    users[user.id] = user
    done(null, user.id)
})

// deserialize the user from the session
passport.deserializeUser(function(id, done) {
    var user = users[id]
    done(null, user)
})

passport.use(new FacebookStrategy(config,
    function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile)
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
        return res.status(400).send('No username and password!')
    }

    User.find({ username: username }).exec(function(err, items) {
        if (items && items.length > 0) {
            return res.status(401).send('User already exists!')
        }
        const salt = username + new Date().getTime()
        const hash = md5(password + salt)
        new User({ username: username, salt: salt, hash: hash }).save()
        new Profile({ username: username, dob: dob, email: email, zipcode: zipcode, 
            avatar: null, following: [], headline: '' }).save()
        res.send({
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

    if (!req.cookies[cookieKey]) {
        return res.status(401).send()
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
    req.logout()
    redis.del(req.cookies[cookieKey])
    res.clearCookie(cookieKey)
    // res.redirect('/')
    return res.status(200).send('OK')
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

module.exports = app => {
    app.use(cookieParser())
    app.use(session({ secret: 'thisismysecretMessageyoucannotguessit' }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.post('/login', Login)
    app.post('/register', Register)
    app.use(isLoggedIn)
    app.put('/logout', isLoggedIn, Logout)
    app.put('/password', updatePassword)
    app.use('/login/facebook', passport.authenticate('facebook', {scope: 'email'}))
    app.use('/auth/callback', passport.authenticate('facebook', {successRedirect:'/profile', failureRedirect:'/fail'}))
	app.use('/profile', isLoggedIn, profile)
	app.use('/fail', fail)
}
