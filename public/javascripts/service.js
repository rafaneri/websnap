angular.module('appIoTSelf.service', [])
.factory('IoTSelfService', function($q, $http){
	var service = {
		takeSnapshot: function(){
			var d = $q.defer();
			$http.get('/snapshot/take')
			.success(function(data, status){
				d.resolve(data);
			}).error(function(data, status){
				d.reject(data);
			});
			return d.promise;
		}
	};

	return service;
});