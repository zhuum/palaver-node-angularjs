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

    app.controller('controller-threads', [
            '$scope', '$http',
            function ($scope, $http) {

                $scope.threads = [];

                $http.get('/api/threads').then(function (result) {
                    $scope.threads = result.data;
                });


                $scope.createThread = function () {

                    //alert($scope.threadTitle + ' : ' + $scope.newComment);


                }
            }]
    );


    app.controller('controller-comments', [
            '$scope', '$http', '$window', '$modal',
            function ($scope, $http, $window, $modal) {

                $scope.comments = [];

                $scope.getComments = function () {
                    // get the comments for a thread
                    var urlParts = $window.location.pathname.split('/');

                    var threadUrl;

                    if (urlParts.length < 3) {
                        // default or last thread
                        threadUrl = '/api/threads/lastupdated';
                    } else {
                        threadUrl = '/api/threads/' + urlParts[urlParts.length - 1];
                    }


                    $http.get(threadUrl).then(function (result) {
                        $scope.comments = result.data.comments;
                        $scope.thread = result.data.thread;
                    });
                };

                $scope.getComments();

                $scope.enterNewComment = function (parentComment) {


                };

                $scope.createComment = function (comment) {

                    // replace all of this with socket.io

                    $http.post('/api/comments/create', comment)
                        .success(function (result) {
                            $scope.getComments();
                        }
                    );

                };

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
            scope: {},
            link: function (scope, element, attrs) {


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
                        function (scope, element) {

                            //console.log('linking comment');

                            scope.showReplyText = false;

                            scope.add = function (c) {
                                //scope.comment.comments.push({name:'marcus', text: Math.random(), comments: []});
                            }
                        }
                    );
                }

            };

        }
    );

}) (window.angular);
