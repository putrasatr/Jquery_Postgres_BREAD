var express = require('express');
var router = express.Router();
const url = require('url');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {data:res.rows});
});

module.exports = router;  