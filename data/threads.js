(function () {

	//var seedData = require('./seedData');

    var pg = require('pg');
    var config = require('./config');
    var util = require('util');
    var debug = require('debug')('palaver');

    var events = require('events');

    function ThreadRepository () {
        events.EventEmitter.call(this);
    }

    util.inherits(ThreadRepository, events.EventEmitter);
    var threadRepository = new ThreadRepository();

    threadRepository.getThreads = function (userId, next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                //var text = 'SELECT * FROM threads'; // order by "lastUpdatedTime"';

                var text = 'SELECT threads.id, threads.title, threads."lastUpdatedTime", count(unreadcomments.id) as unread FROM threads ' +
                'left outer join unreadcomments on ( threads.id = unreadcomments."threadId" and unreadcomments."user_userId" = $1 ) ' +
                'group by threads.id, threads.title, threads."lastUpdatedTime"';

                client.query(text, [userId], function (err, result) {
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

    threadRepository.createThread = function (thread, next) {
        pg.connect(config.database.connstring, function (err, client, release) {

            var queryText = 'insert into threads ("title", "userId") values ($1, $2) returning *';
            client.query(queryText, [thread.text, thread.userId ], function (err, results) {

                if (err) {
                    client.query('ROLLBACK', function (err) {
                        release();
                        next(err);
                    });
                } else {
                    client.query('COMMIT', function (err) {
                        release();

                        debug(JSON.stringify(results));
                        threadRepository.emit('new thread', results.rows[0]);

                        next(err, results.rows[0]);

                    });
                }

            });
        });

    };

    module.exports = threadRepository;

}) ();