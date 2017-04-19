/*
 * Test suite for profile.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const resource = (method, endpoint, payload) => {
    const url = `http://localhost:3000/${endpoint}`
    const options = {
        method,
        headers: {'Content-Type': 'application/json'}
    }
    if (payload) {
        options.body = JSON.stringify(payload)
    }

    return fetch(url, options).then(r => {
        if (r.status == 200) {
            return r.json()
        } else {
            console.error(`${method} ${endpoint} ${r.statusText}`)
            throw new Error(r.statusText)
        }
    })
}

describe('Validate profile functionality', () => {

    it('returns headline message for default user', done => {
        resource('GET', 'headlines')
            .then( r => {
                expect(r.headlines[0].username).to.eql('sq6')
                expect(r.headlines[0].headline).to.exist
            }).then(done).catch(done)
    })

    it('returns a headline message, one for each user in url', done => {
        const users = 'sq6,yp15,zj7'
        resource('GET', `headlines/${users}`)
            .then( r => {
                expect(r.headlines[0].username).to.eql('sq6')
                expect(r.headlines[0].headline).to.exist
                expect(r.headlines[1].username).to.eql('yp15')
                expect(r.headlines[1].headline).to.exist
                expect(r.headlines[2].username).to.eql('zj7')
                expect(r.headlines[2].headline).to.exist
            }).then(done).catch(done)
    })

    it("updates default user's headline", done => {
        const newheadline = 'This is a new headline!'
        const defaultuser = 'sq6'
        resource('PUT', 'headline', {headline: newheadline})
            .then(r => {
                expect(r.username).to.eql(defaultuser)
                expect(r.headline).to.eql(newheadline)
            }).then( () => {
                return resource('GET', 'headlines')
            }).then( r => {
                expect(r.headlines[0].username).to.eql(defaultuser)
                expect(r.headlines[0].headline).to.eql(newheadline)
            }).then(done).catch(done)            
    })

    it('returns the email for default user', done => {
        resource('GET', 'email')
            .then( r => {
                expect(r.username).to.eql('sq6')
                expect(r.email).to.exist
            }).then(done).catch(done)
    })

    it('returns the email for a specified user', done => {
        const user = 'zj7'
        resource('GET', `email/${user}`)
            .then( r => {
                expect(r.username).to.eql('zj7')
                expect(r.email).to.exist
            }).then(done).catch(done)
    })

    it("updates default user's email", done => {
        const newemail = 'newemail@gmail.com'
        const defaultuser = 'sq6'
        resource('PUT', 'email', {email: newemail})
            .then(r => {
                expect(r.username).to.eql(defaultuser)
                expect(r.email).to.eql(newemail)
            }).then( () => {
                return resource('GET', 'email')
            }).then( r => {
                expect(r.username).to.eql(defaultuser)
                expect(r.email).to.eql(newemail)
            }).then(done).catch(done) 
    })

    it('returns the zipcode for default user', done => {
        resource('GET', 'zipcode')
            .then( r => {
                expect(r.username).to.eql('sq6')
                expect(r.zipcode).to.exist
            }).then(done).catch(done)
    })

    it('returns the zipcode for a specified user', done => {
        const user = 'zj7'
        resource('GET', `zipcode/${user}`)
            .then( r => {
                expect(r.username).to.eql('zj7')
                expect(r.zipcode).to.exist
            }).then(done).catch(done)
    })

    it("updates default user's zipcode", done => {
        const newzipcode = '47408'
        const defaultuser = 'sq6'
        resource('PUT', 'zipcode', {zipcode: newzipcode})
            .then(r => {
                expect(r.username).to.eql(defaultuser)
                expect(r.zipcode).to.eql(newzipcode)
            }).then( () => {
                return resource('GET', 'zipcode')
            }).then( r => {
                expect(r.username).to.eql(defaultuser)
                expect(r.zipcode).to.eql(newzipcode)
            }).then(done).catch(done) 
    })

    it('returns the avatar for default user', done => {
        resource('GET', 'avatars')
            .then( r => {
                expect(r.avatars[0].username).to.eql('sq6')
                expect(r.avatars[0].avatar).to.exist
            }).then(done).catch(done)
    })

    it('returns an avatar message, one for each user in url', done => {
        const users = 'sq6,yp15,zj7'
        resource('GET', `avatars/${users}`)
            .then( r => {
                expect(r.avatars[0].username).to.eql('sq6')
                expect(r.avatars[0].avatar).to.exist
                expect(r.avatars[1].username).to.eql('yp15')
                expect(r.avatars[1].avatar).to.exist
                expect(r.avatars[2].username).to.eql('zj7')
                expect(r.avatars[2].avatar).to.exist
            }).then(done).catch(done)
    })

    it("updates default user's avatar", done => {
        const newavatar = 'newAvatar'
        const defaultuser = 'sq6'
        resource('PUT', 'avatar', {avatar: newavatar})
            .then(r => {
                expect(r.username).to.eql(defaultuser)
                expect(r.avatar).to.eql(newavatar)
            }).then( () => {
                return resource('GET', 'avatars')
            }).then( r => {
                expect(r.avatars[0].username).to.eql(defaultuser)
                expect(r.avatars[0].avatar).to.eql(newavatar)
            }).then(done).catch(done)            
    })
})

