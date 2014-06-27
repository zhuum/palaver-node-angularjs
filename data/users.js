(function (users) {

	var pg = require('pg');
	var config = require('./config');

	users.addUser = function (user, next) {

		pg.connect(config.database.connstring, function (err, client, release) {

			if (err)
				next(err);
			else {

				// add user to the database
				var text = 'insert into users (name, email, username, passwordHash, salt) values ($1, $2, $3, $4, $5)';

				client.query(text, [user.name, user.email, user.username, user.passwordHash, user.salt], function (err) {
					
					if (err) {
						console.log(err);
						client.query('ROLLBACK', function (err) {
							release();
							next(err);
						});
					} else {
						console.log('commiting new user');
						client.query('COMMIT', function (err) {
							console.log('commited user');
							release();
							next(err);
						});
					}

				});
			}
		});
	};

	users.getUser = function (username, next) {
		
		pg.connect(config.database.connstring, function (err, client, release) {

			if (err) 
				next(err);
			else {

				var text = 'select name, email, username, passwordHash, salt from users';

				client.query(text, function (err, result) {
					release();
					if (err) {
						next(err);
					} else {
						
						if (result.rows.length > 0) {
							next(err, result.rows[0]);
						} else {
							next(err, null);
						}

					}
					
				});
			}
		});		
	}

	users.updateUser = function(user, next) {
		next();
	}

}) (module.exports);