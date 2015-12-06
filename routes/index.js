var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Добро пожаловать!' });
});

// TODO сделал временно для проверки подключения к БД
// TODO удалить потом
var models = require('../models'); // including models class to access DB rows
router.get('/db-test', function(req, res, next) {
//    models.answers.create({ // sample how to create model instances in DB
//        result: 1,
//        stage_description_id: 2,
//        question_id: 3,
//        trash: "fadfaf"
//    }).then(function() {
//        console.log("kek");
//    });

    // models.sequelize.query("INSERT INTO discipline (teacher_id, subject_id, group_id) VALUES (1, 2, 3);");

//    models.answers.findAll(
//        // { include: [ models.Task ]}
//    ).then(function(users) {
//           res.send(users);
//    });
});

module.exports = router;