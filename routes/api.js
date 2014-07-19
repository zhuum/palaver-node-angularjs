var express = require('express');
var router = express.Router();

var auth = require('../data/auth');


router.post('/comments/create', auth.ensureApiAuthenticated, function(req, res) {

    var data = require('../data/comments');

    var comment = {
        threadId: req.body.threadId,
        parentCommentId: req.body.parentCommentId,
        text: req.body.text,
        userId: req.user.id
    };

    data.createComment(comment, function (err, comment) {

        if (err) {
            res.send(500, err.message);
        } else {
            res.send(200, comment);
        }

    });

});

router.get('/threads/create', auth.ensureApiAuthenticated, function(req, res) {

    var data = require('../data/threads');

    data.getLastComments(function (err, results) {

        res.set('Content-Type', 'application/json');
        res.send(results);

    });

});

router.get('/threads/lastupdated', auth.ensureApiAuthenticated, function(req, res) {

    var data = require('../data/comments');

    data.getLastComments(function (err, results) {

        res.set('Content-Type', 'application/json');
        res.send(results);

    });

});

router.get('/threads/:id', auth.ensureApiAuthenticated, function(req, res) {
	
	var data = require('../data/comments');

	data.getThread(req.params.id, function (err, results) {

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