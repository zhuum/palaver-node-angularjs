(function (comment) {

	//var seedData = require('./seedData');

    var pg = require('pg');
    var config = require('./config');

    var db = require('./database');

    var parseComments = function (comments) {

        var map = {}, comment, roots = [];

        for (var i = 0; i < comments.length; i += 1) {

            comment = comments[i]; // get the main comment
            comment.comments = []; // add a comments field

            map[comment.id] = i; // use map to look-up the parents
            if (comment.parentCommentId !== null ) {  // is child?
                comments[map[comment.parentCommentId]].comments.push(comment);  // add to children
            } else {
                roots.push(comment);  // main thread comment, add to root
            }
        }

        return roots;
    }

    comment.getComments = function (threadId, next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                var text ='select c.*, u.name from comments as c inner join users as u on c."userId" = u.id where c."threadId" = $1 order by c.id'

                client.query(text, [threadId], function (err, result) {
                    release();
                    if (err) {
                        next(err);
                    } else {
                        next(err, parseComments(result.rows));
                    }
                });
            }
        });
	}

    comment.getLastComments = function (next) {

        var text = 'select c.id, c.text, c."createdTime", c."lastUpdatedTime", c."parentCommentId", u.name from comments c ' +
            'inner join users as u on u.id = c."userId", ' +
            '(select id from threads order by "lastUpdatedTime" limit 1) as last ' +
            'where c."threadId" = last.id ' +
            'order by c.id';

        db.select(
            text,
            null,
            function (err, result) {
                next(err, parseComments(result.rows));
            }

        )

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
                var text = 'insert into comments (text, "userId", "parentCommentId", "threadId" ) values ($1, $2, $3, $4, $5)';

                client.query(text, [/* UPDATE */ ], function (err) {

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