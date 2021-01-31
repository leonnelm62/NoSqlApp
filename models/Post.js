const postsCollection = require('../db').db().collection("posts")
const ObjectID = require('mongodb').ObjectID

let Post = function(data, userid) {
    this.data = data
    this.errors = []
    this.userid = userid
}

Post.prototype.cleanUp = function() {
    if(typeof(this.data.title) != "string") {this.data.title = ""}
    if(typeof(this.data.body) != "string") {this.data.body = ""}

    // eviter tout mauvaise entrée
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdData: new Date(),
        author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function() {
    if(this.data.title == "") {this.errors.push("Vous n'avez pas fourni de titre")}
    if(this.data.body == "") {this.errors.push("Vous n'avez pas fourni de post")}
}

Post.prototype.create = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if(!this.errors.length) {
            // Enregistre en BD
            postsCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Essayez encore.")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
}

module.exports = Post