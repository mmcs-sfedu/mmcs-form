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

    models.feedback_form.findAll().then(function(feedback_forms) {
        res.send("" + feedback_forms.length);
    });

    /* To create all tables in database. */
    models.feedback_stage.findAll().then(function(feedback_stages) {
        res.send(feedback_stages);
    });

//    models.answers.create({ // sample how to create model instances in DB
//        result: 1,
//        stage_description_id: 2,
//        question_id: 3,
//        trash: "fadfaf"
//    }).then(function() {
//        console.log("kek");
//    });
//
//    models.sequelize.query("INSERT INTO discipline (teacher_id, subject_id, group_id) VALUES (1, 2, 3);");
//
//    models.stage_description.findAll(
//        // { include: [ models.Task ]}
//    ).then(function(users) {
//            res.send(users);
//        });
//
//    var feedback_form = models.feedback_form.create({
//        name : "KEK"
//    });
//
//    models.feedback_form.findAll().then(function(loc) {
//        models.feedback_stage.create({
//            date_from:new Date(),
//            date_to:new Date(),
//            feedback_form_id:loc[0].id
//        });
//    });

});

module.exports = router;