var express = require('express');
var router = express.Router();

var auth = require('../data/auth');

/* GET home page. */
router.get('/',
	auth.ensureAuthenticated,
	function(req, res) {

    res.render('index', {
        message: req.flash('message'),
        user: req.user
    });
});

module.exports = router;
