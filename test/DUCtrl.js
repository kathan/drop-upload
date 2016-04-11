var DUApp = angular.module("DUApp",[]);

DUApp.controller('DUCtrl', function ($scope, $http, $rootScope){
  var du = DropUpload({targetElement: '#du', hoverClass: 'my-class'});
  
  du.addEventListener('files-dropped', (e) => {
    $scope.files = e.detail;
    $scope.$apply();
  });
  
  du.addEventListener('progress', (e) => {
    $scope.$apply();
  });
  
  du.addEventListener('error', (e) => {
    $('#debug').text('Some bad stuff happened');
  });
  
  $scope.upload = function(){
    du.upload('http://your-server.url/that/receives/uploads', (e) => {
      var i = 0;
    });
  }
});