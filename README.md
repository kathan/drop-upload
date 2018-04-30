# drop-upload
A dependency free library to receive drag-and-drop files, upload the files and monitor the progress those Files.

## Usage
### HTML
```html
<html>
  <head>
    <script src="../drop-upload.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min.js"></script>
    <script src="DUCtrl.js"></script>
    <style>
    body{
      font-family: sans-serif;
    }
    #files{
      list-style: none;
    }
    
    .du{
      vertical-align:middle;
      line-height: 100px;
      text-align: center;
      width: 350px;
      height: 100px;
      color: grey;
      border: 1px dotted grey;
    }
    
    .my-class{
      color: black !important;
      border: 3px solid black !important;
    }
    
    .progress-frame{
      background-color: #dbdbdb;
      width: 200px;
      border-radius: 3px;
      border: 1px solid #c0c0c0;
      overflow: hidden;
    }
    
    </style>
  </head>
  <body ng-app="DUApp" ng-controller="DUCtrl">
    <div id="debug"></div>
    <div id="du" class="du">
      <span>Drop files here</span>
    </div>
    <button ng-click="upload()">Upload</button>
    <ul id="files" ng-repeat="file in files">
      <li>
        {{file.name}}
        <div class="progress-frame">
          <div ng-style="{'border-top': '1px solid #3886d8', 'border-bottom': '1px solid #3886d8','border-radius':'5px','background-color':'419bf9','height':'3px','width': file.progress*2}"></div>
        </div>
      </li>
    </ul>
  </body>
</html>
```
### Javascript (Using Angular)
```javascript
var DUApp = angular.module("DUApp",[]);

DUApp.controller('DUCtrl', function ($scope, $http, $rootScope){
  var du = DropUpload({targetElement: '#du', hoverClass: 'my-class'});
  
  $scope.upload = function(){
    /*************************************************
     * Change the value of my_url to set it in action
     *************************************************/
     var my_url = 'http://your-server.url/that/receives/uploads'
    du.upload(my_url, function(e) {
      var i = 0;
    });
  }
  
  du.addEventListener('files-dropped', function(e) {
    /************************************************
     * e.detail contains an array of the files that were dropped.
     *************************************************/
    $scope.files = e.detail;
    $scope.$apply();
  });
  
  du.addEventListener('progress', function(e) {
    /*************************************************
     * Each file has a progress property that is updated,
     * which is being used in the Angular template to set 
     * the width of the progress bar.
     * Since the list of files is in $scope.files,
     * all that needs to be done is to call $scope.$apply.
     **************************************************/
    $scope.$apply();
  });
  
  du.addEventListener('error', function(e) {
    $('#debug').text('Some bad stuff happened');
  });
});
```
