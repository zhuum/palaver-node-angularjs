var express = require('express');
var router = express.Router();

var auth = require('../data/auth');

/* GET home page. */
router.get('/',
	auth.ensureAuthenticated,
	function(req, res) {

	var threads = require('../data/threads');
    var comments = require('../data/comments');

	console.log('index');

    threads.getThreads(function (err, threads) {

		console.log(threads);

		console.log(req.user);

        var activeThread = threads[0],
            threadId = activeThread.id;

        comments.getComments(threadId, function (err, comments) {

            console.log(comments);

            if (err) req.flash('message', err.message);

            res.render('index', {
                threads: threads,
                comments: comments,
                activeThread: activeThread,
                message: req.flash('message'),
                user: req.user
            });
        });



	});

});

module.exports = router;
