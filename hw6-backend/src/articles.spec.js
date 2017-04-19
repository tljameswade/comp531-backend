/*
 * Test suite for articles.js
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

describe('Validate article functionality', () => {

    let artSize
	it('should give me three or more articles', (done) => {
        resource('GET', 'articles')
            .then( r => {
                artSize = r.articles.length
                expect(artSize >= 3).to.be.true
            }).then(done).catch(done)
    })


    it('adds a new article to the list of all articles and return the newly added article', (done) => {

        const newArticle = { "text": "A new article" }
        resource('POST', 'article', newArticle)
            .then(body => {
                expect(body.text).to.eql(newArticle.text)
            }).then( () => {
                return resource('GET', 'articles')
            }).then(r => {
                expect(r.articles.length).to.eql(artSize + 1)
            }).then(done).catch(done)        
    })

    it('should return an article with a specified id', done => {
        const randomId = Math.floor(1 + Math.random() * (artSize - 1))
        resource('GET', `articles/${randomId}`)
            .then(r => {
                expect(r.articles.length == 1).to.be.true
            }).then(done).catch(done)
    })

	it('should return nothing for an invalid id', done => {
		// call GET /articles/id where id is not a valid article id, perhaps 0
		// confirm that you get no results
        resource('GET', 'articles/0')
            .then(r => {
                expect(r.articles.length).to.eql(0)
            }).then(done).catch(done)
    })

});