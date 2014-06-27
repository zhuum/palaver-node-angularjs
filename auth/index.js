var express = require('express');
var router = express.Router();
var app = express();

var users = require('../data/users');
var hash = require('../data/hash');
var passport = require('passport');
var localstrat = require('passport-local').Strategy;

function verifyUser(username, password, next) {
	users.getUser(username, function (err, user) {

		console.log(user);

		if (!err && user) {
			var testHash = hash.computeHash(password, user.salt);

			if (testHash === user.passwordhash) {
				console.log('user verified');

				next(null, user);
				
				return;
			}
		}

		next(err, false, {message: 'Invalid credentials'});
	})
}

// setup passport authentication
passport.use(new localstrat(verifyUser));

passport.serializeUser(function (user, next) {
	next(null, user.username);
});

passport.deserializeUser(function (key, next){
	users.getUser(key, function (err, user) {
		if (err) {
			next (null, false, {message: 'Failed to get user'});
		} else {
			next (null, user);
		}
	});
});

router.get('/register', function(req, res) {

	res.render('register', {title: 'Register', message: req.flash('registrationError')  });

});

router.post('/register', function(req, res) {

	console.log('begin register post');

	var salt = hash.createSalt();

	var user = {
		name: req.body.name,
		email: req.body.email,
		username: req.body.username,
		passwordHash: hash.computeHash(req.body.password, salt),
		salt: salt
	};

	console.log(user);

	users.addUser(user, function (err) {

		if (err) {
			req.flash('registrationError', 'Could not register.');
			res.redirect('/auth/register');
		} else {
			res.redirect('/auth/login');
		}
	});
});


router.get('/login', function(req, res) {

	res.render('login', {title: 'Login', message: req.flash('loginError')});

});


router.post('/login', function(req, res, next) {

	var authFunc = passport.authenticate('local', function (err, user, info) {
		if (err || info) {
            req.flash('loginError', 'Invalid credentials');
            res.redirect('/auth/login');
		} else {

			req.logIn(user, function (err) {
				if (err) {
                    req.flash('loginError', err.message);
                    res.redirect('/auth/login');

				} else {
					res.redirect('/');
				}
			});

		}
	});

	authFunc(req, res, next);

});

router.get('/logout', function(req, res) {

    req.logout();
    res.redirect('/auth/login');

});

module.exports = router;