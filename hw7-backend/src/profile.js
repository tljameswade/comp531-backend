
const Profile = require('./model').Profile
const uploadImage = require('./uploadCloudinary')
// Function to get headlines for users
const getHeadlines = (req, res) => {
    const users = req.params.users ? req.params.users.split(',') : [req.username]
    Profile.find({username: {$in: users}}).exec(function(err, items) {
        if (items == null || items.length == 0) {
            return res.status(400).send()
        }
        const headlines = items.map(item => {
            return {
                username: item.username,
                headline: item.headline
            }
        })
        return res.status(200).send({ headlines: headlines })
    })
}

// Function to renew a headline
const putHeadline = (req, res) => {
    Profile.update({username: req.username}, {$set: {headline: req.body.headline}}, {new: true}, function(){})
    return res.status(200).send({
        username: req.username,
        headline: req.body.headline
    })
}

// Function to get avatars for users
const getAvatars = (req, res) => {
    const users = req.params.users ? req.params.users.split(',') : [req.username]
    Profile.find({username: {$in: users}}).exec(function(err, items) {
        if (items == null || items.length == 0) {
            return res.status(400).send()
        }
        const avatars = items.map(item => {
            return {
                username: item.username,
                avatar: item.avatar
            }
        })
        return res.status(200).send({ avatars: avatars })
    })
}

// Function to renew avatar for the logged in user
const uploadAvatar = (req, res) => {
    Profile.update({username: req.username}, {$set: {avatar: req.fileurl}}, {new: true}, function(){})
    return res.status(200).send({
        username: req.username,
        avatar: req.fileurl
    })
}

// Function to get email for the loggedin user
const getEmail = (req, res) => {
    Profile.find({username: req.username}).exec(function(err, items) {
        return res.status(200).send({
            username: req.username,
            email: items[0].email
        })
    })
}

// Function to renew email for the loggedin user
const putEmail = (req, res) => {
    Profile.update({username: req.username}, {$set: {email: req.body.email}}, {new: true}, function(){})
    return res.status(200).send({
        username: req.username,
        email: req.body.email
    })
}

// Function to get the zipcode for the loggedin user
const getZipcode = (req, res) => {
    Profile.find({username: req.username}).exec(function(err, items) {
        return res.status(200).send({
            username: req.username,
            zipcode: items[0].zipcode
        })
    })
}

// Function to update the zipcode for the loggedin user
const putZipcode = (req, res) => {
    Profile.update({username: req.username}, {$set: {zipcode: req.body.zipcode}}, {new: true}, function(){})
    return res.status(200).send({
        username: req.username,
        zipcode: req.body.zipcode
    })
}

// Function to get the date of birth for the loggedin user
const getDob = (req, res) => {
    Profile.find({username: req.username}).exec(function(err, items) {
        return res.status(200).send({
            username: req.username,
            dob: items[0].dob
        })
    })
}

module.exports = app => {
    app.get('/headlines/:users?', getHeadlines)
    app.put('/headline', putHeadline)
    app.put('/avatar', uploadImage('avatar'), uploadAvatar)
    app.get('/avatars/:users?', getAvatars)
    app.get('/email/:user?', getEmail)
    app.put('/email', putEmail)
    app.get('/zipcode/:user?', getZipcode)
    app.put('/zipcode', putZipcode)
    app.get('/dob', getDob)
}