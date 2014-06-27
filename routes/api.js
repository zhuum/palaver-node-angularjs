var express = require('express');
var router = express.Router();

var auth = require('../data/auth');


router.get('/threads/:id', auth.ensureApiAuthenticated, function(req, res) {
	
	var data = require('../data/comments');

	data.getComments(req.params.id, function (err, results) {

		res.set('Content-Type', 'application/json');
		res.send(results);

	});

});


router.get('/threads', auth.ensureApiAuthenticated, function(req, res) {

	console.log('getting threads data object');
	
	var data = require('../data/threads');

	//console.log(data);

	data.getThreads(function (err, results) {

		console.log(results);

		res.set('Content-Type', 'application/json');
		res.send(results);

	});

});

module.exports = router;