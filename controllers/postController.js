const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res) {
    res.render('create-post')
}

exports.create = function(req, res) {
    let post = new Post(req.body, req.session.user._id)
    post.create().then(function(newId){
        req.flash("success", "Nouveau post crée")
        req.session.save(() => res.redirect(`/post/${newId}`))
    }).catch(function(errors){
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/create-post"))
    })
}

exports.viewSingle = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post})
    } catch {
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id)
        if(post.authorId == req.visitorId) {
            res.render("edit-post", { post: post })
        } else {
            req.flash("errors", "Vous n'êtes pas autorisé à poursuivre cette action ")
            req.session.save(() => res.redirect("/"))
        }
    } catch {
        res.render("404")
    }
}

exports.edit = function(req, res) {
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then((status) => {
        // post modifié de la bd
        // utilisateur authorisé mais erreur durant l'opération
        if(status == "success") {
            // post modifié en bd
            req.flash("success", "Post modifié avec succès")
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        } else {
            post.errors.forEach(function(error) {
                req.flash("errors", error)
            })
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
    }).catch(() => {
        //si l'id du post n'exist pas
        //si le visteur n'est pas le propriétaire du post
        req.flash("errors", "Vous n'êtes pas autorisé à poursuivre cet action")
        req.session.save(function() {
            res.redirect("/")
        })
    })
}

exports.delete = function(req, res) {
    Post.delete(req.params.id, req.visitorId).then(() => {
        req.flash("success", "Le post a été supprimé avec succès")
        req.session.save(() => {res.redirect(`/profile/${req.session.user.username}`)})
    }).catch(() => {
        req.flash("errors", "Vous n'êtes pas autorisé à effectuer cette action")
        req.session.save(() => {res.redirect("/")})
    })
}

exports.search = function(req, res) {
    Post.search(req.body.searchTerm).then(posts => {
        res.json(posts)
    }).catch(() => {
        res.json([])
    })
}