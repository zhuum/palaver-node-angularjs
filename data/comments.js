(function (commentRepository) {

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

    commentRepository.getComments = function (threadId, next) {

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

    commentRepository.getComment = function (commentId, next) {

        var query ='select c.*, u.name from comments as c inner join users as u on c."userId" = u.id where c."id" = $1'

        db.select(query, [commentId], function (err, result) {
            if (err) {
                next(err);
            } else {
                next(err, result.rows.length > 0 ? result.rows[0] : null);
            }
        });
    }

    commentRepository.getLastComments = function (next) {

        var threadQuery = 'select t.*, u.name from threads t inner join users as u on u.id = t."userId" order by "lastUpdatedTime" limit 1';

        db.select(
            threadQuery,
            null,
            function (err, result) {

                if (err) {
                    next(err);
                } else {

                    var thread = result.rows[0];

                    var commentQuery = 'select c.*, u.name from comments as c inner join users as u on u.id = c."userId" where "threadId" = $1 order by c.id';

                    db.select(
                        commentQuery,
                        [thread.id],
                        function (err, comments) {
                            if (err) {
                                next(err);
                            } else {
                                next(err, {thread: thread, comments: parseComments(comments.rows)});
                            }
                        }
                    );
                }
            }

        );

    }

    commentRepository.createComment = function (comment, next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                // add user to the database
                var text = 'insert into comments (text, "userId", "parentCommentId", "threadId" ) values ($1, $2, $3, $4) returning id';

                client.query(text, [comment.text, comment.userId, comment.parentCommentId, comment.threadId ], function (err, results) {

                    if (err) {
                        client.query('ROLLBACK', function (err) {
                            release();
                            next(err);
                        });
                    } else {
                        client.query('COMMIT', function (err) {
                            release();

                            commentRepository.getComment(results.rows[0].id, function (err, result) {
                                if (err) {
                                    next(err);
                                } else {
                                    next(err, result);
                                }
                            });
                        });
                    }

                });
            }
        });
    };

}) (module.exports);