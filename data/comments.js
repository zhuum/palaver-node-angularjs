(function (comment) {

	//var seedData = require('./seedData');

    var pg = require('pg');
    var config = require('./config');

    comment.getComments = function (threadId, next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                var text ='select c.*, u.name from comments as c inner join users as u on c."userId" = u.id where c."id" = $1 or c."parentCommentId" = $1 order by c.id'

                client.query(text, [threadId], function (err, result) {
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

    comment.addComment = function (comment, next) {

        var newComment = {
            text: 'this is a new comment',
            userId: 13,
            parentCommentId: 1
        };

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                // add user to the database
                var text = 'insert into comments (text, "userId", "parentCommentId" ) values ($1, $2, $3, $4, $5)';

                client.query(text, [user.name, user.email, user.username, user.passwordHash, user.salt], function (err) {

                    if (err) {
                        client.query('ROLLBACK', function (err) {
                            release();
                            next(err);
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

}) (module.exports);