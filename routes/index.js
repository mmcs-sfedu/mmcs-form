var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Добро пожаловать!' });
});

router.get('/test', function(req, res, next) {
    models.subject.find({
        order: [
            models.Sequelize.fn( 'RANDOM' )
        ]
    }).then(function(rese) {
        if (rese == null)
            console.log("OY!");
        res.send(rese);
    });
});

module.exports = router;