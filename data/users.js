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

                        var customErr = err;

                        if (err.code === '23505') {
                            customErr = {message: 'Duplicate name or username'};
                        }

						client.query('ROLLBACK', function (err) {
							release();
							next(customErr);
						});
					} else {
						client.query('COMMIT', function (err) {
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

				var text = 'select * from users where username = $1';

				client.query(text, [username], function (err, result) {
					release();
					if (err) {
						next(err);
					} else {

						if (result.rows.length > 0) {
							next(err, result.rows[0]);
						} else {
							next({message: 'No user found'}, null);
						}

					}
					
				});
			}
		});		
	};

    users.getUsers = function (next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                var text = 'select * from users order by name';

                client.query(text, function (err, result) {
                    release();
                    if (err) {
                        next(err);
                    } else {
                        next(err, result.rows);
                    }

                });
            }
        });
    };

	users.updateUser = function(user, next) {
		next();
	};

}) (module.exports);