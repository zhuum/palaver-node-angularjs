(function (config) {

    // save as 'config.js' and enter the appropriate information

	config.database = {
		connstring: "postgres://postgres:password@localhost/palaver"
	};

    config.ssl = {
        privateKey: './ssl/server.key',
        certificate: './ssl/server.crt'
    };

    config.site = {
        session: {
            cookieName: 'session',
            secret: 'keyboard cat',
            duration: 24 * 60 * 60 * 1000,
            activeDuration: 1000 * 60 * 5
        },
        port: 80,
        sslport: 443
    };

}) (module.exports);