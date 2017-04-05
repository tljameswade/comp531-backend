const md5 = require('md5')
const cookieParser = require('cookie-parser')

// Default users UsersList
const UsersList = {
    'sq6': {
        username: 'sq6',
        hash: md5('12345' + 'randomsalt'),
        salt: 'randomsalt'
    }
}

// Add a new user
const newUser = (username, password) => {
    const salt = new Date().getTime() + username
    UsersList[username] = {username: username, hash: md5((password + salt)), salt: salt}
}

// The function to register for a new user
const Register = (req, res) => {

    if (!req.body.username || !req.body.password) {
        return res.status(400).send('No username and password!')
    }

    if (UsersList[req.body.username]) {
        return res.status(400).send('This user already exists!')
    }

    newUser(req.body.username, req.body.password)

    res.send({
        username: req.body.username,
        status: 'success'
    })
}

const cookieKey = 'sid'

let bookmark = 1

// Function to generate a session id
const generateCode = (userObj) => {
    return bookmark++;
}

// Function to login
const Login = (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
        return res.status(400).send('Input username and password!')
    }

    const userObj = UsersList[username]

    if (!userObj || userObj.hash !== md5(password + userObj.salt)) {
        return res.status(401).send('Unauthorized!')
    }

    res.cookie(cookieKey, generateCode(userObj), {maxAge: 3600*1000, httpOnly: true})
    
    const msg = {username: username, result: 'success'}
    res.send(msg)
}

// Function to logout
const Logout = (req, res) => {
    bookmark = 1
    return res.status(200).send('OK')
}

module.exports = app => {
    app.use(cookieParser())
    app.post('/login', Login)
    app.post('/register', Register)
    app.put('/logout', Logout)
}