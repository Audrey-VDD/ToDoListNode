const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// router.post('/login', (req, res) => {
//     const { mail, password } = req.body;
//     const loginUser = "SELECT mail, password FROM users WHERE mail LIKE ?;";
//     bdd.query(loginUser, [mail], async (error, result) => {
//         if (error) throw error;
//         if(result.length === 0) {
//             res.send("n'existe pas")
//         }
//         const decrypt = await bcrypt.compare(password, result[0].password);
//         if (decrypt === true) {
//             res.send("connexion réussie")
//         } else {
//             res.status(401).send("C'est la merde");
//         }
//     });
// });


// Login avec bcrypt et token



router.post('/login', (req, res) => {
    const { mail, password } = req.body;
    const loginUser = "SELECT * FROM users WHERE mail = ?;";
    bdd.query(loginUser, [mail], (error, result) => {
        if (error) throw error;
        if (result.length > 0) {
            // On va chercher le premier élément du tableau
            const user = result[0];
            bcrypt.compare(password, user.password, (error, toto) => {
                if (error) throw error;
                if (toto) {
                    // .sign c'est la création et il va comporter, il vaut mieux envoyer l'email plutôt que l'ID parce qu'avec l'ID, on peut récupérer toutes les infos du users
                    // on aurait pu mettre {id: user.idUser, mail: user.mail} et on peut rajouter ce qu'on veut, même un message "message" : "ceci est un token"
                    const token = jwt.sign({ id: user.idUser, role: user.role }, 'secretkey', { expiresIn: '3h' });
                    res.json({ token });
                } else {
                    res.status(401).send('mot de passe incorrect');
                }
            });
        } else {
            res.status(404).send('Inconnu au bataillon');
        }
    })
});

// Ajouter user avec mot de passe crypté
router.post('/addUser', (req, res) => {
    const { firstname, lastname, password, mail } = req.body;
    const checkMail = "SELECT mail FROM users WHERE mail = ?;";
    bdd.query(checkMail, [mail], (error, result) => {
        // A la place de "if (error) throw error; on peut enlever throw error pour que ça ne crache pas"
        if (error) throw error;
        if (result.length > 0) {
            return res.status(401).send("Cet email est déjà utilisé");
        } else {
            const securedPassword = bcrypt.hashSync(password, 10)
            // hashSync : raccourci de l'async et l'await
            const addUser = "INSERT INTO users (firstname, lastname, password, mail) VALUES (?,?,?,?);";
            bdd.query(addUser, [firstname, lastname, securedPassword, mail], (error, result) => {
                if (error) throw error;
                res.send("Utilisateur ajouté")
            });
        };
    });
});

// suppr user que si on est admin
router.delete('/deleteUser/:id', auth.authentification, (req, res) => {
    if (req.role != "admin") {
        return res.status(401).send('Vous n\'avez pas le droit de supprimer')
        // Comme il y a un return, ça va bloquer le déroulé la fonction
    }
    const { id } = req.params;
    const deleteUser = "DELETE FROM users WHERE idUser = ?;";
    bdd.query(deleteUser, [id], (error, result) => {
        if (error) throw error;
        res.send("utilisateur supprimé");
    });
});

// Modifier un user
router.post('/updateUser/:id', (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, password, mail } = req.body;
    const updateUser = "UPDATE users SET firstname=?, lastname=?, password=?, mail=? WHERE idUser=?;";
    bdd.query(updateUser, [firstname, lastname, password, mail, id], (error, result) => {
        if (error) throw error;
        res.send("utilisateur modifié")
    });
});

// Afficher tous les users
router.get('/getAllUser', auth.authentification, (req, res) => {
    if (req.role != "admin") {
        return res.status(401).send('Vous n\'êtes pas admin')
    }
    const getAllUsers = "SELECT * FROM users;";
    bdd.query(getAllUsers, (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});


// Afficher un user en fonction de son mail
router.get('/getUserById/:id', (req, res) => {
    // l'id est identique à celui de l'url, du chemin :id
    const { id } = req.params;
    const getUserById = 'SELECT * FROM users WHERE mail=?;';
    bdd.query(getUserById, [id], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher users par tâche
router.get('/getUserByIdTask/:idTask', (req, res) => {
    const { idTask } = req.params;
    const getUserByIdTask = "SELECT tasks.nameTask, state.nameState, users.firstname, users.lastname FROM users INNER JOIN userTask ON users.idUser = userTask.idUser INNER JOIN tasks ON tasks.idTask = userTask.idTask INNER JOIN state ON state.idState = tasks.idState WHERE tasks.idTask=?;";
    bdd.query(getUserByIdTask, [idTask], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher le nombre de tâches par idUser
router.get('/getNbTaskByIdUser/:idUser', (req, res) => {
    const { idUser } = req.params;
    const getNbTaskByIdUser = "SELECT COUNT(idTask) FROM userTask WHERE idUser =?;";
    bdd.query(getNbTaskByIdUser, [idUser], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher le nombre de tâches par état en fonction de l'idUser
router.get('/getNbTaskByStateByIdUser/:idUser', (req, res) => {
    const { idUser } = req.params;
    const getNbTaskByStateByIdUser = "SELECT COUNT(tasks.idTask), state.nameState FROM state INNER JOIN tasks ON state.idState = tasks.idState INNER JOIN userTask ON tasks.idTask = userTask.idTask WHERE idUser =? GROUP BY state.nameState ORDER BY state.nameState;";
    bdd.query(getNbTaskByStateByIdUser, [idUser], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

module.exports = router;