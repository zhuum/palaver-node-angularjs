var express = require('express');
var router = express.Router();


var auth = require('../data/auth');
var users = require('../data/users');


router.get('/:username', auth.ensureAdmin, function(req, res) {

    users.getUser(req.params.username, function (err, refUser) {

        if (err) {
            res.redirect('/');
        } else {
            res.render('users/details', {refUser: refUser, user: req.user });
        }

    });

});

router.get('/', auth.ensureAdmin, function(req, res) {

    users.getUsers(function (err, users) {

        if (err) {
            res.redirect('/');
        } else {
            res.render('users/index', {users: users, user: req.user });
        }

    });



});

module.exports = router;
