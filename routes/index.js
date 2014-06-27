var express = require('express');
var router = express.Router();

var auth = require('../data/auth');

/* GET home page. */
router.get('/',
	auth.ensureAuthenticated,
	function(req, res) {

	var data = require('../data/threads');

	console.log('index');

	data.getThreads(function (err, results) {

		console.log('got threads');

		console.log(results);

		var activeThread;

		for (var i = results.length - 1; i >= 0; i--) {
			if (results[i].parentId === 1)
				activeThread = results[i];

		};

		console.log('active thread: ');
		console.log(activeThread);

		console.log(req.user);

		res.render('index', {
			threads: results, 
			activeThread: activeThread,
			error: err,
			user: req.user
		});

	});

});

module.exports = router;
