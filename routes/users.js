var express = require('express');
var router = express.Router();


var auth = require('../data/auth');
var users = require('../data/users');
var hash = require('../data/hash');


router.get('/:username/approve', auth.ensureAdmin, function(req, res) {

    users.approve(req.params.username, function (err) {
        res.redirect('back');
    })

});


router.get('/:username/unapprove', auth.ensureAdmin, function(req, res) {

    users.unapprove(req.params.username, function (err) {
        res.redirect('back');
    })

});

router.get('/:username/changepassword', auth.ensureOwnerOrAdmin, function(req, res) {

    res.render('users/changepassword', {user: req.user, message: req.flash('passwordError') });

});

router.post('/:username/changepassword', auth.ensureOwnerOrAdmin, function(req, res, next) {

    // validate old password
    if ( !hash.isPassword(req.body.oldpassword, req.user.salt, req.user.passwordhash) ) {
        res.render('users/changepassword', {user: req.user, message: 'Invalid old password', success: false });
        return;
    }

    // make sure that passwords match
    if ( req.body.newpassword !== req.body.confirmpassword) {
        res.render('users/changepassword', {user: req.user, message: 'Passwords don\'t match', success: false });
        return;
    }

    users.changePassword(req.body.newpassword, req.params.username, function (err) {

        if (err) {
            res.render('users/changepassword', {user: req.user, message: 'Error changing password', success: false });
        } else {
            res.render('users/changepassword', {user: req.user, message: 'Password has been updated', success: true });
        }

    });

});

router.get('/:username', auth.ensureOwnerOrAdmin, function(req, res) {

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
