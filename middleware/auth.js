const jwt = require("jsonwebtoken");

const authentification = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        console.log('Token reçu', token);
        jwt.verify(token.split(' ')[1], 'secretkey', (error, decode) => {
            if (error) {
                console.log('Errur de vérification du token :', error);
                console.log(token);
                return res.status(401).send('token incorrect');
            } else {
                req.userId = decode.id;
                req.role = decode.role;
                next();
            }
        });

    } else {
        res.status(401).send('aucun token');
    }
};

module.exports = {authentification}