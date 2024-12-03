const mysql = require("mysql2");
require('dotenv').config();

const connexion = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NAME,
});

connexion.connect((error) =>{
    if (error) throw error;
    console.log("connexion BDD ok");    
});

module.exports = connexion;