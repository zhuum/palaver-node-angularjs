(function () {

	//var seedData = require('./seedData');

    var pg = require('pg');
    var config = require('./config');

    var db = require('./database');
    var util = require('util');
    var debug = require('debug')('palaver');

    var userRepository = require('./users');

    debug('comments repo init');

    var events = require('events');

    function CommentsRepository () {
        events.EventEmitter.call(this);
    }

    util.inherits(CommentsRepository, events.EventEmitter);
    var commentRepository = new CommentsRepository();

    self = commentRepository;

    commentRepository.getComments = function (threadId, next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                var text = 'select c.*, u.name, unreadcomments.id is null "isRead" ' +
                    'from comments as c inner join users as u on (c."userId" = u.id) ' +
                    'left outer join unreadcomments on (c.id = unreadcomments."comment_commentId" and "user_userId" = u.id) ' +
                    'where c."threadId" = $1 order by c.id';

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
	};

    commentRepository.getComment = function (commentId, next) {

        var query ='select c.*, u.name, unreadcomments.id is null "isRead" ' +
            'from comments as c inner join users as u on c."userId" = u.id ' +
            'left outer join unreadcomments on (c.id = unreadcomments."comment_commentId" and "user_userId" = u.id) ' +
            'where c."id" = $1';

        db.select(query, [commentId], function (err, result) {
            if (err) {
                next(err);
            } else {
                next(err, result.rows.length > 0 ? result.rows[0] : null);
            }
        });
    };

    commentRepository.getThread = function (threadId, next, onlyThreadInfo) {

        var threadQuery = 'select t.*, u.name from threads t inner join users as u on u.id = t."userId" where t.id = $1';

        db.select(
            threadQuery,
            [threadId],
            function (err, result) {

                if (err) {
                    next(err);
                } else {

                    var thread = result.rows[0];

                    if (!onlyThreadInfo) {
                        var commentQuery = 'select c.*, u.name, unreadcomments.id is null "isRead" ' +
                            'from comments as c inner join users as u on (c."userId" = u.id) ' +
                            'left outer join unreadcomments on (c.id = unreadcomments."comment_commentId" and "user_userId" = u.id) ' +
                            'where c."threadId" = $1 order by c.id';

                        db.select(
                            commentQuery,
                            [threadId],
                            function (err, comments) {
                                if (err) {
                                    next(err);
                                } else {
                                    next(err, {thread: thread, comments: comments.rows});
                                }
                            }
                        );
                    } else {
                        next(err, {thread: thread});
                    }


                }
            }

        );

    };

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
                                next(err, {thread: thread, comments: comments.rows});
                            }
                        }
                    );
                }
            }

        );

    };

    commentRepository.createUnread = function (commentId, commentUserId, next) {

        pg.connect(config.database.connstring, function (err, client, release) {

            userRepository.getUsers(function (err, users) {
                var count = 0;
                for (var i = 0; i < users.length; i++) {
                    if (commentUserId != users[i].id) {
                        var queryText = 'insert into unreadcomments ("comment_commentId", "user_userId") values ($1, $2)';
                        client.query(queryText, [commentId, users[i].id], function (err) {
                            if (err) {
                                debug(err);
                            }

                            count++;
                            if (count === users.length - 1 ) {
                                release();
                                next();
                            }
                        });
                    }
                }

            });
        });

    };

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

                            var commentId = results.rows[0].id,
                                commentUserId = comment.userId;

                            // populate unread

                            commentRepository.createUnread(commentId, commentUserId, function () {

                                commentRepository.getComment(commentId, function (err, result) {
                                    if (err) {
                                        next(err);
                                    } else {
                                        debug(JSON.stringify(result));
                                        result.isRead = false;
                                        commentRepository.emit('newest comment', result);
                                        next(err, result);
                                    }
                                });

                            });
                        });
                    }

                });
            }
        });
    };

    commentRepository.markRead = function (commentId, userId, next) {

        debug('marking a comment read');

        pg.connect(config.database.connstring, function (err, client, release) {

            if (err)
                next(err);
            else {

                var text =
                    'delete from unreadcomments ' +
                    'where "comment_commentId" = $1 ' +
                    'and "user_userId" = $2';

                client.query(text, [ commentId, userId ], function (err, results) {

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

    module.exports = commentRepository;

}) ();