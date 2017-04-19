
let articles = [
    {
        id: 1,
        author: 'sq6',
        text: 'First article',
        date: new Date(),
        comments: []
    },
    {
        id: 2,
        author: 'yp15',
        text: 'Second article',
        date: new Date(),
        comments: []
    },
    {
        id: 3,
        author: 'zj7',
        text: 'Third article',
        date: new Date(),
        comments: []
    }
]

const getArticles = (req, res) => {
    if (req.params.id) {
        res.send({articles: articles.filter(article =>  article.id == req.params.id )})
    }
    else {
        res.send({articles: articles})
    }
}

const postArticle = (req, res) => {
    const nextId = articles.length + 1
    const newAuthor = req.body.author ? req.body.author : "newAuthor"
    const newText = req.body.text ? req.body.text : "A new article"
    const newArticle = {
        id: nextId,
        author: newAuthor,
        text: newText,
        date: new Date(),
        comments: []
    }
    articles.push(newArticle)
    res.send(newArticle)
}

module.exports = app => {
    app.get('/articles/:id*?', getArticles)
    app.post('/article', postArticle)
}