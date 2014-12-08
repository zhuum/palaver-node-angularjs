(function (updater) {

    var debug = require('debug')('updater');
    var socketio = require('socket.io');

    debug('loading updater');

    updater.init = function (server, comments, threads) {

        var io = socketio.listen(server);

        io.on('connection', function (socket) {

            debug('user connected');

        });

        comments.on('newest comment', function (comment) {

            debug('new comment created event: ' + JSON.stringify(comment));

            io.sockets.emit('new comment', comment);

        });

        threads.on('new thread', function (thread) {

            io.sockets.emit('new thread', thread);

        });
    };


})(module.exports);












//io.use(passportSocketIo.authorize({
//    cookieParser: cookieParser(),
//    key:         'express.sid',       // the name of the cookie where express/connect stores its session_id
//    secret:      config.secret,    // the session_secret to parse the cookie
//    store:       session
//}));
//
//
//
//var comments = require('./data/comments');
//var threads = require('./data/threads');
//
//io.on('connect', function (socket) {
//    socket.on('create comment', function (comment) {
//
//        // comment.text, comment.userId, comment.parentCommentId, comment.threadId
//
//
//        // add comment to database and send to everyone
//        var newComment = comments.createComment(comment);
//
//
//        socket.emit('new comment', newComment);
//    });
//
//
//});

