var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Добро пожаловать!' });
});

// TODO сделал временно для проверки подключения к БД
// TODO удалить потом вместе с моделью temp_user
var models = require('../models'); // including models class to access DB rows
router.get('/db-test', function(req, res, next) {
    models.User.create({ // sample how to create model instances in DB
        username: 'Some User ' + Math.random()
    });

    models.User.findAll(
        // { include: [ models.Task ]}
    ).then(function(users) {
           res.send(users);
    });
});

module.exports = router;