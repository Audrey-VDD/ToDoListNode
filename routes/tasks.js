const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Afficher toutes les tâches
router.get('/allTasks', (req, res) => {
    const getAllTasks = "SELECT * FROM tasks;";
    bdd.query(getAllTasks, (error, result) => {
        if (error) throw error;
        res.json(result);
    })
});

// Afficher tâches avec condition dans le back en fonction du role du user
router.get('/getTaskByIdUser', auth.authentification, (req, res) => {
    let getTask = "";
    if(req.role == "admin") {
        getTask = "SELECT tasks.nameTask, tasks.descriptionTask, tasks.idTask, state.nameState, state.idState, users.firstname FROM tasks INNER JOIN userTask ON userTask.idTask = tasks.idTask INNER JOIN users ON users.idUser = userTask.idUser INNER JOIN state ON state.idState = tasks.idState;";
    } else {
        getTask = "SELECT tasks.nameTask, tasks.descriptionTask, tasks.idTask, state.nameState, state.idState, users.firstname FROM tasks INNER JOIN userTask ON userTask.idTask = tasks.idTask INNER JOIN users ON users.idUser = userTask.idUser INNER JOIN state ON state.idState = tasks.idState WHERE users.idUser=?;";
    }
    bdd.query(getTask, [req.userId], (error, result) => {
        if (error) throw error;
        res.json(result);
        console.log(req.userId);        
    });
});

// Afficher sans authentification
// router.get('/getTaskByIdUser/:idUser', (req, res) => {
//     const { idUser } = req.params;
//     const getTaskByIdUser = "SELECT tasks.nameTask, tasks.descriptionTask, state.nameState, users.firstname FROM tasks INNER JOIN userTask ON userTask.idTask = tasks.idTask INNER JOIN users ON users.idUser = userTask.idUser INNER JOIN state ON state.idState = tasks.idState WHERE users.idUser=?;";
//     bdd.query(getTaskByIdUser, [idUser], (error, result) => {
//         if (error) throw error;
//         res.json(result);
//     });
// });

// Afficher une tâche par son id
router.get('/getTaskByIdTask/:idTask', (req, res) => {
    const { idTask } = req.params;
    const getTaskByIdTask = "SELECT tasks.nameTask, tasks.descriptionTask, tasks.idState FROM tasks WHERE tasks.idTask=?;";
    bdd.query(getTaskByIdTask, [idTask], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher tâches triées par état
router.get('/getTaskOrderByState', (req, res) => {
    const getTaskOrderByState = "SELECT tasks.nameTask, tasks.descriptionTask, state.nameState FROM tasks INNER JOIN state ON state.idState = tasks.idState ORDER BY state.idState;";
    bdd.query(getTaskOrderByState, (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher taches en fonction de l'état
router.get('/getTaskByIdState/:idState', (req, res) => {
    const { idState } = req.params;
    const getTaskByIdState = "SELECT tasks.nameTask, tasks.descriptionTask, state.nameState FROM tasks INNER JOIN state ON state.idState = tasks.idState WHERE state.idState =?;";
    bdd.query(getTaskByIdState, [idState], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher nb de tâches par état
router.get('/getNbTaskOrderByState/:idState', (req, res) => {
    const { idState } = req.params;
    const getNbTaskOrderByState = "SELECT COUNT(tasks.idTask), state.nameState FROM tasks INNER JOIN state ON state.idState = tasks.idState GROUP BY state.idState;";
    bdd.query(getNbTaskOrderByState, [idState], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher nb users pour toutes les tâches
router.get('/getAllUserByTask', (req, res) => {
    const getAllUserByTask = "SELECT COUNT(users.idUser), tasks.nameTask, tasks.descriptionTask, state.nameState FROM users INNER JOIN userTask ON users.idUser = userTask.idUser INNER JOIN tasks ON userTask.idTask = tasks.idTask INNER JOIN state ON tasks.idState = state.idState GROUP BY tasks.idTask;";
    bdd.query(getAllUserByTask, (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher nb users par idTache
router.get('/getNbUserByIdTask/:idTask', (req, res) => {
    const { idTask } = req.params;
    const getNbUserByIdTask = "SELECT COUNT(users.idUser), tasks.nameTask, tasks.descriptionTask, state.nameState FROM users INNER JOIN userTask ON users.idUser = userTask.idUser INNER JOIN tasks ON userTask.idTask = tasks.idTask INNER JOIN state ON tasks.idState = state.idState WHERE tasks.idTask =? GROUP BY tasks.idTask;";
    bdd.query(getNbUserByIdTask, [idTask], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Afficher nb user par état
router.get('/getNbUserByIdState/:idState', (req, res) => {
    const { idState } = req.params;
    const getNbUserByIdState = "SELECT COUNT(users.idUser), state.nameState FROM users INNER JOIN userTask ON users.idUser = userTask.idUser INNER JOIN tasks ON userTask.idTask = tasks.idTask INNER JOIN state ON tasks.idState = state.idState WHERE state.idState =? GROUP BY state.idState;";
    bdd.query(getNbUserByIdState, [idState], (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

// Ajouter une task avec le user sans authentification
// router.post('/addTask', (req, res) => {
//     const { nameTask, descriptionTask, idState, idUser } = req.body;
//     const addTask = "INSERT INTO tasks (nameTask, descriptionTask, idState) VALUES (?,?,?);";
//     bdd.query(addTask, [nameTask, descriptionTask, idState], (error, result) => {
//         if (error) {
//             return res.status(500).send("Erreur ajout de la tâche.");
//         }
//         const taskId = result.insertId;
//         console.log(result.insertId);
//         const addTaskOnUser = "INSERT INTO userTask (idUser, idTask) VALUES (?, ?);";
//         bdd.query(addTaskOnUser, [idUser, taskId], (error, result) => {
//             if (error) {
//                 return res.status(500).send("Erreur ajout table d'association");
//             }
//             res.send("Miracle")
//         });
//     });
// });




// Avec authentifaction 


router.post('/addTask', auth.authentification, (req, res) => {
    const { nameTask, descriptionTask, idState } = req.body;
    const addTask = "INSERT INTO tasks (nameTask, descriptionTask, idState) VALUES (?,?,?);";
    bdd.query(addTask, [nameTask, descriptionTask, idState], (error, result) => {
        if (error) {
            return res.status(500).send("Erreur ajout de la tâche.");
        }
        const taskId = result.insertId;
        console.log(result.insertId);
        const addTaskOnUser = "INSERT INTO userTask (idUser, idTask) VALUES (?, ?);";
        bdd.query(addTaskOnUser, [req.userId, taskId], (error, result) => {
            if (error) {
                return res.status(500).send("Erreur ajout table d'association");
            }
            res.send("Miracle")
        });
    });
});



// Modifier une task
router.patch('/updateTask/:idTask', (req, res) => {
    const { idTask } = req.params;
    const { nameTask, descriptionTask, idState } = req.body;
    const updateTask = "UPDATE tasks SET nameTask=?, descriptionTask=?, idState=? WHERE idTask=?;";
    bdd.query(updateTask, [nameTask, descriptionTask, idState, idTask], (error, result) => {
        if (error) throw error;
        res.send("task modifiee");
    });

});

// Suppr une task
router.delete('/deleteTaskById/:idTask', auth.authentification, (req, res) => {
    const { idTask } = req.params;
    const deleteTaskById = "DELETE FROM tasks WHERE idTask =?;";
    bdd.query(deleteTaskById, [idTask], (error, result) => {
        if (error) throw error;
        res.send("Task deleted");
    });
});

module.exports = router;