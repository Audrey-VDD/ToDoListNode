const express = require('express');
const app = express();
const bdd = require('./bdd');
require('dotenv').config();
const cors = require("cors");
// Dépendance qui permet de traiter les données dans le req.body qu'on envoie
const bodyParser = require('body-parser');
const userRoute = require('./routes/user');
const tasksRoute = require('./routes/tasks');

// Les middleware décrypte ce que le front envoie au back
// express.json ou app.use(bodyParser.json());
// cors donne l'accès à tout et on peut paramétrer pour que l'accès soit autorisé que pour une bdd spécifique
app.use(cors());
app.use(express.json());

app.use('/todoapi/user', userRoute);
app.use('/todoapi/tasks', tasksRoute);

app.listen(process.env.PORT || 3000,() =>{
    console.log("je suis sur le port 3000");
});