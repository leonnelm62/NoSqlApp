const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const app = express()
const sanitizeHTML = require('sanitize-html')

let seesionOptions = session({
    secret: "JavaScript is the best",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

app.use(seesionOptions)
app.use(flash())

app.use(function(req, res, next) {
    // markdown accèssible à tous les template
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
    }
    // alerte erreur et succès visible sur toutes les pages
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")
    // ID de l'utilisateur valide sur l'objet courant
    if(req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}

    // session utilisateur disponible pour tout utilisateur
    res.locals.user = req.session.user
    next()
})

const router = require('./router')

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app