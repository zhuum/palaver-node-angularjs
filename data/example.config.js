(function (config) {

    // save as 'config.js' and enter the appropriate information

	config.database = {
		connstring: "postgres://postgres:password@localhost/palaver"
	};

    config.site = {
        session: {
            cookieName: 'session',
            secret: 'keyboard cat',
            duration: 24 * 60 * 60 * 1000,
            activeDuration: 1000 * 60 * 5
        }
    };

}) (module.exports);