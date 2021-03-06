
const Article = require('./model').Article
const Profile = require('./model').Profile
const Comment = require('./model').Comment
const md5 = require('md5')
const uploadImage = require('./uploadCloudinary')

// The function to get articles
const getArticles = (req, res) => {
    if (req.params.id) {
        Article.find({ _id: req.params.id }).exec(
            function(err, items) {
                if (items != null && items.length > 0) {
                    return res.status(200).send({ articles: items[0] })
                }
                else {
                    Article.find({ author: req.params.id }).exec(
                        function(e, authorItems) {
                            if (authorItems == null || authorItems.length == 0) {
                                return res.status(400).send('No such article')
                            }
                            else {
                                return res.status(200).send({ articles: authorItems })
                            }
                        }
                    )
                }
            }
        )
    }
    else {
        Profile.find({ username: req.username }).exec(function(err, items) {
            const userObj = items[0]
            const usersToQuery = [req.username, ...userObj.following]
            Article.find({ author: {$in: usersToQuery} }).sort('-date').limit(10).exec(function(err, articleItems) {
                return res.status(200).send({ articles: articleItems })
            })
        })
    }
}

// The function to post a new article
const postArticle = (req, res) => {
    new Article({ author: req.username, img: req.fileurl, date: new Date(), text: req.body.text, comments: [] }).save(
        function(err, item) {
            return res.status(200).send({ articles: [item] })
    })
}

// The function to edit an Article or a comment or post a new comment
const editArticle = (req, res) => {
    Article.find({ _id: req.params.id }).exec(
        function(err, items) {
            if (items == null || items.length == 0) {
                return res.status(401).send()
            }
            if (req.body.commentId == -1) {
                const newCommId = md5(req.username + new Date().getTime())
                const newComm = new Comment({ commentId: newCommId, author: req.username, date: new Date(), text: req.body.text })
                new Comment(newComm).save()
                Article.findByIdAndUpdate(req.params.id, {$addToSet: {comments: newComm}}, {upsert: true, new: true}, function(err, newCommArticle) {
                    return res.status(200).send({ articles: [newCommArticle] })
                })
            }
            else if (req.body.commentId) {
                Comment.find({ commentId : req.body.commentId }).exec(function(err, editComm) {
                    if (editComm[0].author == req.username) {
                        Comment.update({commentId: req.body.commentId}, {$set: {text:req.body.text}}, {new:true}, function(){})
                        Article.update({_id: req.params.id, 'comments.commentId': req.body.commentId}, {$set: {'comments.$.text': req.body.text}}, {new: true}, function(){})
                        Article.find({_id: req.params.id}).exec(function(err, editCommArticle) {
                            return res.status(200).send({ articles: [editCommArticle] })
                        })
                    }
                })
            } else {
                if (items[0].author = req.username) {
                    Article.findByIdAndUpdate(req.params.id, {$set: {text: req.body.text}}, {new: true}, function(err, editedArticle) {
                        return res.status(200).send({ articles: [editedArticle] })
                    })                    
                }
            }
        }
    )
}

module.exports = app => {
    app.get('/articles/:id*?', getArticles)
    app.post('/article', uploadImage('article'), postArticle)
    app.put('/articles/:id', editArticle)
}