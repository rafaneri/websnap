

angular.module('appIoTSelf', ['ngRoute', 'appIoTSelf.service'])
.controller('IoTSelfController', function($scope, IoTSelfService){

	$scope.takeSnapshot = function(){
        IoTSelfService.takeSnapshot().then(function(data){
            console.log("Snap Start", data);
        });
    };

    $scope.init = function() {
    }

});