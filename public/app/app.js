( function (angular) {

    var app = angular.module('view-threads', ['ui.bootstrap']);

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
            getThreads: function (next) {
                $http.get('/api/threads').then(function (result) {
                    next(result.data);
                });
            },
            createComment: function (comment, next) {

                $http.post('/api/comments/create', comment)
                    .success(function (result) {
                        //$scope.getComments();
                        next();
                    }
                );

            },
            createThread: function () {

            }
        }
    } ]);

    app.controller('controller-threads', [
            '$scope', 'threadService',
            function ($scope, threadService) {

                $scope.threads = [];

                threadService.getThreads(function (threads) {
                    $scope.threads = threads;
                });

            }]
    );


    app.controller('controller-comments', [
            '$scope', 'threadService',
            function ($scope, threadService) {

                threadService.getThread(null, function (result) {
                    $scope.thread = result.thread;
                    $scope.comments = result.comments;

                })
            }]
    );


    $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active')
    });

    app.directive('paCommentForm', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/partials/reply-input.html',
            scope: {
                comment: '=',
                showReplyText: '='
            },
            link: function (scope, element) {

                scope.createComment = function () {

                    scope.showReplyText = false;

                    element.find('textarea').val('');

                }
            }
        };
    });

    app.directive('paComment', function (RecursionHelper) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    comment: '='
                },
                templateUrl: '/app/partials/comment.html',
                compile: function(element) {
                    // Use the compile function from the RecursionHelper,
                    // And return the linking function(s) which it returns
                    return RecursionHelper.compile(element,
                        function (scope) {

                            scope.showReplyText = false;

                        }
                    );
                }

            };

        }
    );

}) (window.angular);
