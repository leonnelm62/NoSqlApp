const bcrypt = require("bcryptjs")
const usersCollection = require('../db').db().collection("users")
const { default: validator } = require("validator")
const validate = require("validator")
const md5 = require('md5')

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function() {
    if(typeof(this.data.username) != "string") {
        this.data.username = ""
    }

    if(typeof(this.data.email) != "string") {
        this.data.email = ""
    }

    if(typeof(this.data.password) != "string") {
        this.data.password = ""
    }

    //Prévenir toutes mauvaises entrée
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {
        if (this.data.username == "") {
            this.errors.push("Vous n'avez pas fourni de nom d'utilisateur")
        }

        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
            this.errors.push("L'identifiant ne doit contenir que des lettres et chiffres")
        }

        if (!validator.isEmail(this.data.email)) {
            this.errors.push("Vous n'avez pas fourni d'adresse email valide")
        }

        if (this.data.password == "") {
            this.errors.push("Vous n'avez pas fourni de mot de passe correct")
        }
        //
        if (this.data.username.length > 0 && this.data.username.length < 3) {
            this.errors.push("L'identifiant doit être d'au moins 3 caractères")
        }

        if (this.data.username.length > 30) {
            this.errors.push("L'identifiant ne doit pas être plus de 30 caractères ")
        }
        //
        if (this.data.password.length > 0 && this.data.password.length < 12) {
            this.errors.push("Le mot de passe doit être d'au moins 12 caractères")
        }

        if (this.data.password.length > 50) {
            this.errors.push("Le mot de passe ne doit pas être plus de 50 caractères ")
        }

        // Si l'identifiant est validé alors on vérifi s'il n'exist pas déjà en bd
        if (this.data.username.length > 2 && this.data.username.length < 31 && validate.isAlphanumeric(this.data.username)) {
            let usernameExists = await usersCollection.findOne({ username: this.data.username })
            if (usernameExists) { this.errors.push("Cet identifiant est déjà pris") }
        }

        // Si l'email est validé alors on vérifi s'il n'exist pas déjà en bd
        if (validator.isEmail(this.data.email)) {
            let emailExists = await usersCollection.findOne({ email: this.data.email })
            if (emailExists) { this.errors.push("Cet email est déjà pris") }
        }
        resolve()
    })
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({ username: this.data.username }).then((attemptedUser) => {
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
                this.data = attemptedUser
                this.getAvatar()
                resolve("Félicitation")
            } else {
                reject("Mot de passe ou utilisateur incorrect")
            }
        }).catch(function() {
            reject("Revenez plus tard")
        })
    })
}

User.prototype.register = function() {
    return new Promise(async (resolve, reject) => {
        // Etape #1: Validation data
        this.cleanUp()
        await this.validate()

        //Etape #2: S'il n'y à pas d'erreur après validation
        //Alors enregistre en base de donnée
        if (!this.errors.length) {
            //hash de mot de passe
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

User.prototype.getAvatar = function() {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

module.exports = User