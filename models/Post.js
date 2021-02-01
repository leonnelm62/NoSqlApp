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
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function() {
    if(this.data.title == "") {this.errors.push("Vous n'avez pas fourni de titre")}
    if(this.data.body == "") {this.errors.push("Vous n'avez pas fourni de valeur à votre post")}
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

Post.findSingleById = function(id) {
    return new Promise(async function(resolve, reject) {
        if(typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return 
        }
        let post = await postsCollection.findOne({_id: new ObjectID(id)})
        if(post) {
            resolve(post)
        } else {
            reject()
        }
    })
}
module.exports = Post