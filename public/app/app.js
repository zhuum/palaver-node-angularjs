( function (angular) {

    var app = angular.module('app', ['ui.bootstrap', 'ngRoute', 'btford.socket-io']);


    app.config(function ($routeProvider) {
        $routeProvider
            .when('/threads/:threadId',
            {
                templateUrl: '/app/partials/comments.html',
                controller: 'commentViewCtrl',
                resolve: {
                    thread: commentViewCtrl.loadComments
                }
            })
            .when('/',
            {
                template: '<div>Loading thread...</div>',
                controller: function ($location, threadService) {

                    console.log('in index route...');
                    threadService.getLatestThread(function (result) {

                        $location.url('/threads/' + result.thread.id);

                    });

                }
            });

    });

    app.factory('socket', function (socketFactory) {
        var socket = socketFactory();
        return socket;
    });

    app.factory('RecursionHelper', ['$compile', function($compile){
        return {
            compile: function(element, link){
                // Normalize the link parameter
                if(angular.isFunction(link)){
                    link = { post: link };
                }

                // Break the recursion loop by removing the contents
                var contents = element.contents().remove();
                var compiledContents;
                return {
                    pre: (link && link.pre) ? link.pre : null,
                    // Compiles and re-adds the contents
                    post: function(scope, element){
                        // Compile the contents
                        if(!compiledContents){
                            compiledContents = $compile(contents);
                        }
                        // Re-add the compiled contents to the element
                        compiledContents(scope, function(clone){
                            element.append(clone);
                        });

                        // Call the post-linking function, if any
                        if(link && link.post){
                            link.post.apply(null, arguments);
                        }
                    }
                };
            }
        };
    }]);

    app.factory('userService', ['$http',  function ($http) {

        return {

            getUsername: function () {
                // gets the username from a global object... there is probably a better way to do this.
                return palaver.username;
            }

        };

    }]);

    app.factory('threadService', ['$http',  function ($http) {

        return {
            getThread: function (threadId, next) {
                var threadUrl;

                if (threadId) {
                    threadUrl = '/api/threads/' + threadId;
                } else {
                    threadUrl = '/api/threads/lastupdated';
                }

                $http.get(threadUrl).then(function (result) {

                    var thread = {
                        comments: result.data.comments,
                        thread: result.data.thread
                    };

                    next( thread );
                });
            },
            getLatestThread: function (next) {
                $http.get('/api/threads/lastupdated').then(function (result) {

                    var thread = {
                        comments: result.data.comments,
                        thread: result.data.thread
                    };

                    next( thread );
                });
            },
            getThreads: function (next) {
                $http.get('/api/threads').then(function (result) {
                    next(result.data);
                });
            },
            createComment: function (comment, next) {

                $http.post('/api/comments/create', comment)
                    .success(function (result) {
                        next(result);
                    }
                );

            },
            createThread: function (thread, next) {
                $http.post('/api/threads/create', thread)
                    .success(function (result) {
                        console.log('create thread post back');
                        next(result);
                    }
                );
            },
            markRead: function(commentId) {
                $http.get('/api/comments/read/' + commentId);
            }
        }
    } ]);

    app.factory('commentHelper', function () {
        return {
            parseComments: function (comments) {

                var map = {},
                    comment,
                    roots = [];

                for (var i = 0; i < comments.length; i += 1) {

                    comment = comments[i]; // get the current comment from the array

                    comment.comments = []; // add a comments field

                    map[comment.id] = i; // add a field to the map with name of the current comment

                    if ( comment.parentCommentId !== null ) {  // is child?

                        comments[ map[comment.parentCommentId] ].comments.push(comment);  // add to children


                    } else {
                        roots.push(comment);  // main thread comment, add to root
                    }
                }

                return {map: map, roots: roots};
            },
            addComment: function (comment, comments, roots, map) {

                console.log('commentHelper.addComment');

                comment.comments = [];
                var i = comments.length;
                map[comment.id] = i;
                comments.push(comment);


                if ( comment.parentCommentId !== null ) {  // is child?

                    comments[ map[comment.parentCommentId] ].comments.push(comment);  // add to children

                } else {
                    roots.push(comment);  // main thread comment, add to root
                }

            }
        }
    });

    app.service('commentChannel', function ($rootScope) {

        var newCommentMessage = 'newCommentMessage',
            readCommentMessage = 'readCommentMessage';

        return {
            newComment: function (comment) {
                $rootScope.$broadcast(newCommentMessage, comment);
            },

            onNewComment: function ($scope, handler) {
                $scope.$on(newCommentMessage, function (event, message) {
                    handler(message);
                });
            },
            readComment: function (comment) {
                $rootScope.$broadcast(readCommentMessage, comment);
            },
            onReadComment: function ($scope, handler) {
                $scope.$on(readCommentMessage, function (event, message){
                    handler(message);
                });
            }
        };

    });


    app.controller('mainCtrl' [
            '$scope',
            function ($scope) {
                console.log('loading mainCtrl');
            }]
    );

    var commentViewCtrl = app.controller('commentViewCtrl', [
        '$scope', 'thread', 'threadService', 'commentHelper', 'socket', 'userService', 'commentChannel',
        function ($scope, thread, threadService, commentHelper, socket, userService, commentChannel) {

            console.log('commentViewCtrl: loading...');

            $scope.thread = thread.thread;
            $scope.roots = thread.roots;
            $scope.comments = thread.comments;
            $scope.map = thread.map;

            console.log('commentViewCtrl: setting up comment sockets...');

            socket.forward('new comment', $scope);

            $scope.$on('socket:new comment', function (ev, comment) {
                console.log('commentViewCtrl: socket.on: ' + JSON.stringify(comment));

                commentChannel.newComment(comment);

                if ($scope.thread.id !== comment.threadId) return;

                if (comment.name === userService.getUsername() ) {
                    comment.isRead = true;
                } else {
                    comment.isRead = false;
                }

                commentHelper.addComment(comment, $scope.comments, $scope.roots, $scope.map);
            });

            $scope.newComment = function (data) {

                console.log('creating new comment - commentViewCtrl');

                var newComment = {
                    threadId: $scope.thread.id,
                    text: data.text,
                    parentCommentId: data.parent.id
                };


                threadService.createComment(newComment, function (comment) {
                    console.log(comment);
                });

            };

            $scope.markRead = function (comment) {
                console.log('commentViewCtrl: markRead(...)');
                threadService.markRead(comment.id);
            };

            $scope.foo = function () {
                console.log('new top comment');

                var c = {
                    parent: {id: undefined}, // no parent
                    text: $scope.text
                };

                $scope.text = '';
                $scope.showReplyText = false;

                $scope.newComment(c);
            };
    }]);

    commentViewCtrl.loadComments = function ($q, $route, threadService, commentHelper) {

        console.log('routing loading comments');

        var deferred = $q.defer();

        var threadId = $route.current.params.threadId;

        threadService.getThread(threadId,
            function (result) {

                console.log('got thread');
                console.log(result);

                var helperResult = commentHelper.parseComments(result.comments);

                var thread = {
                    thread: result.thread,
                    comments: result.comments,
                    map: helperResult.map,
                    roots: helperResult.roots
                };

                console.log('thread...');
                console.log(thread);

                deferred.resolve(thread);

            });

        return deferred.promise;
    };

    $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active');
    });

    app.directive('paThreads', function () {
        return {
            restrict: 'E',
            templateUrl: '/app/partials/threads.html',
            controller: function ($scope, $location, threadService, socket, commentChannel, userService) {

                $scope.newThread = false;
                $scope.threads = [];
                $scope.unread = 0;

                console.log('setting up thread sockets...');

                //socket.forward('new comment', $scope);
                socket.forward('new thread', $scope);

                $scope.$on('socket:new thread', function (ev, thread) {
                    console.log('socket thread: new thread');

                    $scope.threads.push(thread);

                });

                commentChannel.onNewComment($scope, function (comment) {

                    console.log('thread: onNewComment');

                    if (comment.name !== userService.getUsername() ) {

                        for (var i = 0; i < $scope.threads.length; i++) {

                            if (comment.threadId === $scope.threads[i].id) {
                                $scope.threads[i].unread++;
                                $scope.unread++;
                                $scope.updateTitle($scope.unread);
                            }

                        }
                    }

                });

                commentChannel.onReadComment($scope, function (comment) {

                    console.log('thread: onReadComment');

                    for (var i = 0; i < $scope.threads.length; i++) {

                        if (comment.threadId === $scope.threads[i].id) {
                            $scope.threads[i].unread--;
                            $scope.unread--;
                            $scope.updateTitle($scope.unread);
                        }

                    }

                });

                threadService.getThreads(function (threads) {
                    console.log(threads);
                    $scope.threads = threads;

                    for (var i = 0; i < $scope.threads.length; i++) {

                        console.log($scope.threads[i].unread);

                        $scope.unread += Number($scope.threads[i].unread);

                    }

                    console.log($scope.unread);

                    $scope.updateTitle($scope.unread);

                });

                $scope.isActive = function (threadId) {
                    return $location.path() === '/threads/' + threadId;
                };

                $scope.addThread = function () {
                    console.log('adding new thread: ' + $scope.newThreadTitle);

                    threadService.createThread({text: $scope.newThreadTitle}, function (result) {
                        console.log('createThread result');
                        console.log(result);
                    });

                    $scope.newThread = false;
                };

                $scope.updateTitle = function (unread) {

                    console.log('updating title');

                    var title = '[b]<' + unread + '>palaver';

                    document.title= title;
                };



            }
        }
    });

    app.directive('paCommentForm', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/partials/reply-input.html'
        };
    });

    app.directive('paComment', function (RecursionHelper, threadService, commentChannel) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    createComment: '=',
                    comment: '='
                },
                templateUrl: '/app/partials/comment.html',
                compile: function(element) {
                    // Use the compile function from the RecursionHelper,
                    // And return the linking function(s) which it returns
                    return RecursionHelper.compile(element,
                        function (scope) {

                            scope.showReplyText = false;

                            scope.foo = function () {

                                console.log('foo called');

                                var c = {
                                    parent: scope.comment,
                                    text: scope.text
                                };

                                scope.text = '';
                                scope.showReplyText = false;

                                scope.createComment(c);
                            };

                            scope.showComment = function(comment) {
                                console.log(comment);
                            };

                            scope.markRead = function (comment) {
                                comment.isRead = true;
                                commentChannel.readComment(comment);
                                threadService.markRead(comment.id);
                            };

                        }
                    );
                }

            };

        }
    );

}) (window.angular);
