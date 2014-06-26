(function (data) {

	var seedData = require('./seedData');

	data.getThreads = function (next) {
		next(null, seedData.initialThreads);
	}

}) (module.exports);