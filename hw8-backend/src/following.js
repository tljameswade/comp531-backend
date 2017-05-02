const Profile = require('./model').Profile

// Function to get the following list
const getFollowing = (req, res) => {
    const username = req.params.user ? req.params.user: req.username
    Profile.find({username: username}).exec(function(err, items) {
        if(items != null && items.length != 0) {
            return res.status(200).send({
                username: username,
                following: items[0].following
            })
        }
    })
}

// Function to follow a user
const addFollowing = (req, res) => {
    const addfollower = req.params.user
    const username = req.username
    Profile.find({ username: addfollower}).exec(function(err, item) {
        if (item == null || item.length == 0) {
            return res.status(400).send('No such user!')
        }
        Profile.findOneAndUpdate({ username: username }, {$addToSet: {following: addfollower}}, {upsert: true, new: true}, 
        function(err, items) {
            return res.status(200).send({
                username: username,
                following: items.following
            })
        })
    })
}

// Function to delete a user being followed
const deleteFollowing = (req, res) => {
    const username = req.username
    const deleteFollow = req.params.user
    Profile.findOneAndUpdate({ username: username }, {$pull: {following: deleteFollow}}, {new: true},
    function(err, items) {
        return res.status(200).send({
            username: username,
            following: items.following
        })
    })

}

module.exports = app => {
    app.get('/following/:user?', getFollowing)
    app.put('/following/:user', addFollowing)
    app.delete('/following/:user', deleteFollowing)
}