(function (data) {

	//var seedData = require('./seedData');

    var pg = require('pg');
    var config = require('./config');


	data.getThreads = function (next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                var text = 'SELECT * FROM threads'; // order by "lastUpdatedTime"';

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

	}

}) (module.exports);