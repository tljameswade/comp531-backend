const md5 = require('md5')
const cookieParser = require('cookie-parser')

const UsersList = {}

const newUser = (username, password) => {
    const salt = new Date().getTime() + username
    UsersList[username] = {username: username, hash: md5((password + salt)), salt: salt}
}

const Register = (req, res) => {

    if (!req.body.username || !req.body.password) {
        return res.status(400).send('No username and password!')
    }

    if (UsersList[req.body.username]) {
        return res.status(400).send('This user already exists!')
    }

    newUser(req.body.username, req.body.password)
    console.log(UsersList)

    res.send({
        username: req.body.username,
        status: 'success'
    })
}

const cookieKey = 'sid'

let bookmark = 1
const generateCode = (userObj) => {
    return bookmark++;
}

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

module.exports = app => {
    app.use(cookieParser())
    app.post('/login', Login)
    app.post('/register', Register)
}