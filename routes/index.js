var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

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

		console.log('rendering');

		res.render('index', {threads: results, activeThread: activeThread});

	});

});

module.exports = router;
