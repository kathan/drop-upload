# drop-upload
A Handler To Receive Drag-And-Drop Files and Upload Those Files.

## Usage
### HTML
`&lt;html&gt;
  &lt;head&gt;
    &lt;script src="../drop-upload.js"&gt;&lt;/script&gt;
    &lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min.js"&gt;&lt;/script&gt;
    &lt;script src="DUCtrl.js"&gt;&lt;/script&gt;
    &lt;style&gt;
    body&#123;
      font-family: sans-serif;
    &#125;
    
    &#35;files&#123;
      list-style: none;
    &#125;
    
    .du&#123;
      vertical-align:middle;
      line-height: 100px;
      text-align: center;
      width: 350px;
      height: 100px;
      color: grey;
      border: 1px dotted grey;
    &#125;
    
    .my-class&#123;
      color: black;
      border: 1px solid black;
    &#125;
    
    .progress-frame&#123;
      background-color: &#35;dbdbdb;
      width: 200px;
      border-radius: 3px;
      border: 1px solid &#35;c0c0c0;
      overflow: hidden;
    &#125;
    
    &lt;/style&gt;
  &lt;/head&gt;
  &lt;body ng-app="DUApp" ng-controller="DUCtrl"&gt;
    &lt;div id="debug"&gt;&lt;/div&gt;
    &lt;div id="du" class="du"&gt;
      &lt;span&gt;Drop files here&lt;/span&gt;
    &lt;/div&gt;
    &lt;button ng-click="upload()"&gt;Upload&lt;/button&gt;
    &lt;ul id="files" ng-repeat="file in files"&gt;
      &lt;li&gt;
        &#123;&#123;file.name&#125;&#125;
        &lt;div class="progress-frame"&gt;
          &lt;div ng-style="&#123;'border-top': '1px solid &#35;3886d8', 'border-bottom': '1px solid &#35;3886d8','border-radius':'5px','background-color':'419bf9','height':'3px','width': file.progress*2&#125;"&gt;&lt;/div&gt;
        &lt;/div&gt;
      &lt;/li&gt;
    &lt;/ul&gt;
  &lt;/body&gt;
&lt;/html&gt;`
### Javascript (Using Angular)
`var DUApp = angular.module("DUApp",[]);

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
});`

