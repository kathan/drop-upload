# drop-upload
A handler to receive drag-and-drop files, upload the files and monitor the progress those Files.

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
      color: black;
      border: 1px solid black;
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
  
  du.addEventListener('files-dropped', (e) => {
    $scope.files = e.detail;
    $scope.$apply();
  });
  
  du.addEventListener('progress', (e) => {
    $scope.$apply();
  });
  
  du.addEventListener('error', (e) => {
    alert('Some bad stuff happened');
  });
  
  $scope.upload = function(){
    du.upload('http://your-server.url/that/receives/uploads', (e) => {
      alert('Upload complete');
    });
  }
});
```
