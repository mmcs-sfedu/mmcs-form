var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Добро пожаловать!' });
});



/* To test database. */
//router.get('/db-test', function(req, res, next) {
//    res.send('It Works!');
//});

module.exports = router;