(function (hash) {

	var crypto = require('crypto');

	hash.createSalt = function () {

		var len = 8;

		return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len);

	};

	hash.computeHash = function (source, salt) {
		
		console.log('salt: ' + salt);
		
		var hmac = crypto.createHmac('sha1', salt);

		var hash = hmac.update(source);

		return hash.digest('hex');
	};

}) (module.exports);