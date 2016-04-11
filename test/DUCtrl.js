var DUApp = angular.module("DUApp",[]);

DUApp.controller('DUCtrl', function ($scope, $http, $rootScope){
  var du = DropUpload({targetElement: '#du', hoverClass: 'my-class'});
  
  du.addEventListener('files-dropped', function(e) {
    $scope.files = e.detail;
    $scope.$apply();
  });
  
  du.addEventListener('progress', function(e) {
    $scope.$apply();
  });
  
  du.addEventListener('error', function(e) {
    $('#debug').text('Some bad stuff happened');
  });
  
  $scope.upload = function(){
    du.upload('http://your-server.url/that/receives/uploads', function(e) {
      var i = 0;
    });
  }
});