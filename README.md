# NoSqlApp
Pensez tout d'abord à créer un fichier ".env" à la racine du repertoire dans lequel vous allez inserer le code suivant:

<
  CONNECTIONSTRING=mongodb+srv://"VOTRE NOM UTILISATEUR":"VOTRE MOT DE PASSE"@cluster0.rb1sw.mongodb.net/ComplexApp?retryWrites=true&w=majority
  PORT=3000 
>
Nous avons créer un identifiant au besoin mais qui va expirer sous peu rassurez vous d'enlever les (") avant de coller votre user et password
VOTRE NOM UTILISATEUR : new-userynov
VOTRE MOT DE PASSE : Fw9fnTfB2jlTzvqi

puis faites un npm-install
démarrer ensuite avec npm run watch
# Pour les utilisateur Mac pensez modifier le fichier package.json en en levant le (start)
Voici le résultat "watch": "nodemon db --ignore frontend-js --ignore public/ && webpack --watch",

On a préférer séparer le lien pour ne pas tout mélanger

Lien des TP NoSQL : https://github.com/leonnelm62/NoSQL
