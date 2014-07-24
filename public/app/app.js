( function (angular) {

    var app = angular.module('app', ['ui.bootstrap', 'ngRoute']);


    app.config(function ($routeProvider) {
        $routeProvider
            .when('/threads/:threadId',
            {
                templateUrl: '/app/partials/comments.html',
                controller: 'mainCtrl',
                resolve: {
                    thread: function ($q, $route, threadService) {
                        var defer = $q.defer();

                        var threadId = $route.current.params.threadId;



                        return defer;

                    }
                }
            })
            .when('/',
            {
                template: '<div>Loading thread...</div>',
                controller: function ($location, threadService) {

                    threadService.getLatestThread(function (result) {

                        $location.url('/threads/' + result.thread.id);

                    });

                }
            });

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
                        next();
                    }
                );

            },
            createThread: function () {

            }
        }
    } ]);


    app.controller('threadCtrl', [
            '$scope', '$routeParams', '$location', '$window', 'threadService',
            function ($scope, $routeParams, $location, $window, threadService) {

                $scope.threads = [];

                threadService.getThreads(function (threads) {
                    $scope.threads = threads;
                });

                $scope.isActive = function (threadId) {
                    return $location.path() === '/threads/' + threadId;
                };

            }]
    );

    app.controller('mainCtrl', [
            '$scope', '$routeParams', '$location', 'threadService',
            function ($scope, $routeParams, $location, threadService) {

                if ($routeParams.threadId) {

                    threadService.getThread($routeParams.threadId ,
                        function (result) {

                            $scope.thread = result.thread;
                            $scope.comments = result.comments;

                    });

                } else {

                    threadService.getLatestThread(
                        function (result) {

                            $location.url('/threads/' + result.thread.id);

                            $scope.thread = result.thread;
                            $scope.comments = result.comments;

                    });

                }

            }]
    );


    $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active')
    });

    app.directive('paThreads', function () {
        return {
            restrict: 'EA',
            templateUrl: '/app/partials/threads.html',
            scope: {
                threads: '=',
                activeThreadId: '=',
                isActive: '='
            },
            link: function (scope) {



            }
        }
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
