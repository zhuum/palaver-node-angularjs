( function (angular) {

    var mod = angular.module('view-threads', []);

    mod.controller('controller-threads', [
        '$scope', '$http',
        function ($scope, $http) {

            $scope.threads = [];

            $http.get('/api/threads').then(function (result) {
                $scope.threads = result.data;
            });
        }]
    );


    mod.controller('controller-comments', [
        '$scope', '$http', '$window',
        function ($scope, $http, $window) {

            $scope.comments = [];

            // get the comments for a thread
            var urlParts = $window.location.pathname.split('/');

            var threadUrl;

            if (urlParts.length < 3 ) {
                // default or last thread
                threadUrl = '/api/threads/lastupdated';
            } else {
                threadUrl = '/api/threads/' + urlParts[urlParts.length-1];
            }

            $http.get(threadUrl).then(function (result) {
                console.log(result.data);
                $scope.comments = result.data;
            });
        }]
    );

}) (window.angular);
