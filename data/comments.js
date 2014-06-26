(function (data) {

	var seedData = require('./seedData');

	data.getComments = function (threadId, next) {
		console.log('thread id: ' + threadId);
		
		next(null, seedData.initialComments);
	}

}) (module.exports);