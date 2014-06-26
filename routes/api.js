var express = require('express');
var router = express.Router();




router.get('/threads/:id', function(req, res) {
	
	var data = require('../data/comments');

	data.getComments(req.params.id, function (err, results) {

		res.set('Content-Type', 'application/json');
		res.send(results);

	});

	res.send({ name: 'foo' });

});


router.get('/threads', function(req, res) {

	console.log('getting threads data object');
	
	var data = require('../data/threads');

	//console.log(data);

	data.getThreads(function (err, results) {

		res.set('Content-Type', 'application/json');
		res.send(results);

	});

	res.send({ name: 'foo' });

});

module.exports = router;