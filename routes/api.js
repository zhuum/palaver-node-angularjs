var express = require('express');
var router = express.Router();
var debug = require('debug')('palaver');
var auth = require('../data/auth');

var events = require('events');

router.post('/comments/create', auth.ensureApiAuthenticated, function(req, res) {

    var data = require('../data/comments');

    debug('/comments/create');

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
            debug('sending: ' + JSON.stringify(comment));
            res.send(200, comment);
        }

    });

});

router.get('/comments/read/:id', auth.ensureApiAuthenticated, function(req, res) {

    var data = require('../data/comments');

    debug('/comments/read');

    var commentId = req.params.id,
        userId = req.user.id;

    debug('commentId: ' + commentId + '; userId: ' + userId);

    data.markRead(req.params.id, req.user.id, function (err) {

        if (err) {
            res.send(500, err.message);
        } else {
            res.send(200);
        }

    });

    res.send(200);

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