const following = {
    'sq6': {
        username: 'sq6',
        following: ['yp15', 'zj7']
    },
    'yp15': {
        username: 'yp15',
        following: ['sq6']
    },
    'zj7': {
        username: 'zj7',
        following: ['yp15']
    }
}

const getFollowing = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const user = req.params.user ? req.params.user: req.user
    res.send({
        username: user,
        following: following[user].following
    })
}

const addFollowing = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const newFollow = req.params.user
    if (!following[req.user].following.includes(newFollow)) {
        following[req.user].following.push(newFollow)
    }
    res.send({
        username: req.user,
        following: following[req.user].following
    })
}

const deleteFollowing = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const deleteFollow = req.params.user
    following[req.user].following = following[req.user].following.filter( follower => {
        return follower != deleteFollow
    })

    res.send({
        username: req.user,
        following: following[req.user].following
    })

}

module.exports = app => {
    app.get('/following/:user?', getFollowing)
    app.put('/following/:user', addFollowing)
    app.delete('/following/:user', deleteFollowing)
}