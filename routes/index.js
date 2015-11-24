var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Добро пожаловать!' });
});

router.get('/survey', function(req, res, next) {
   res.render('survey', { title: 'Страница опроса' })
});

module.exports = router;