const profile = {
    profiles: {
        'sq6': {
            headline: 'First headline',
            email: 'sq6@rice.edu',
            zipcode: '77005',
            dob: (new Date('07/10/1990')).toDateString(),
            avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
        },
        'yp15': {
            headline: 'I am da lang bi',
            email: 'yp15@rice.edu',
            zipcode: '77005',
            dob: (new Date('12/23/1992')).toDateString(),
            avatar: 'dlbPY'
        },
        'zj7': {
            headline: 'I am a fake driver',
            email: 'zj7@rice.edu',
            zipcode: '77005',
            dob: (new Date('03/05/1989')).toDateString(),
            avatar: 'fakedriver'
        },
        'test': {
            headline: 'I am a test case',
            email: 'test@rice.edu',
            zipcode: '12345',
            dob: (new Date('01/12/1994')).toDateString(),
            avatar: 'test'
        }
    }
}

const getHeadlines = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const users = req.params.users ? req.params.users.split(',') : [req.user]
    const headlines = users.map(user => {
        return {
            username: user,
            headline: profile.profiles[user].headline
        }
    })
    res.send({headlines})
}

const putHeadline = (req, res) => {
    if (!req.user) req.user = 'sq6'
    profile.profiles[req.user].headline = req.body.headline
    res.send({
        username: req.user,
        headline: req.body.headline
    })
}

const getAvatars = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const users = req.params.users ? req.params.users.split(',') : [req.user]
    const avatars = users.map(user => {
        return {
            username: user,
            avatar: profile.profiles[user].avatar
        }
    })
    res.send({avatars})
}

const putAvatar = (req, res) => {
    if (!req.user) req.user = 'sq6'
    profile.profiles[req.user].avatar = req.body.avatar
    res.send({
        username: req.user,
        avatar: req.body.avatar
    })
}

const getEmail = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const user = req.params.user ? req.params.user: req.user
    res.send({
        username: user,
        email: profile.profiles[user].email
    })
}

const putEmail = (req, res) => {
    if (!req.user) req.user = 'sq6'
    profile.profiles[req.user].email = req.body.email
    res.send({
        username: req.user,
        email: req.body.email
    })
}

const getZipcode = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const user = req.params.user ? req.params.user: req.user
    res.send({
        username: user,
        zipcode: profile.profiles[user].zipcode
    })
}

const putZipcode = (req, res) => {
    if (!req.user) req.user = 'sq6'
    profile.profiles[req.user].zipcode = req.body.zipcode
    res.send({
        username: req.user,
        zipcode: req.body.zipcode
    })
}

const getDob = (req, res) => {
    if (!req.user) req.user = 'sq6'
    const user = req.params.user ? req.params.user: req.user
    res.send({
        username: user,
        dob: profile.profiles[user].dob
    })
}

module.exports = app => {
    app.get('/headlines/:users?', getHeadlines)
    app.put('/headline', putHeadline)
    app.get('/avatars/:users?', getAvatars)
    app.put('/avatar', putAvatar)
    app.get('/email/:user?', getEmail)
    app.put('/email', putEmail)
    app.get('/zipcode/:user?', getZipcode)
    app.put('/zipcode', putZipcode)
    app.get('/dob', getDob)
}