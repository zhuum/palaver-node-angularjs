(function (database) {

    var pg = require('pg');
    var config = require('./config');


    var rollback = function(client, release) {
        client.query('ROLLBACK', function(err) {
            return release(err);
        });
    };

    database.select = function (query, args, next) {

        pg.connect(config.database.connstring, function (err, client, release) {
            if (err)
                next(err);
            else {
                client.query(query, args, function (err, results) {
                    release();
                    if (err) {
                        next(err);
                    } else {
                        next(err, results)
                    }
                });
            }
        });
    }

    database.transaction = function (query, args, next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {
                client.query(query, args, function (err) {

                    if (err) {
                        rollback(client, release);
                        next(err);
                    } else {
                        client.query('COMMIT', function (err) {
                            release();
                            next(err);
                        });
                    }

                });
            }
        });

    }

}) (module.exports)