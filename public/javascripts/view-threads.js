( function (angular) {

    var mod = angular.module('view-threads', ['ui.bootstrap']);

    mod.controller('controller-threads', [
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


    mod.controller('controller-comments', [
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

                var modalInstance = $modal.open({
                    templateUrl: 'newComment.html',
                    controller: newCommentController
                }); //.opened(function () { });

                modalInstance.result.then(function (commentText) {

                    var newComment = {
                        text: commentText,
                        threadId: parentComment.threadId,
                        parentCommentId: parentComment.id
                    };

                    $scope.createComment(newComment);

                })

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



    var newCommentController = function ($scope, $modalInstance) {

        $scope.input = {};

        $scope.createComment = function () {
            $modalInstance.close($scope.input.newComment);
        };

        $scope.close = function () {
            $modalInstance.close('close');
        };

    };

}) (window.angular);
