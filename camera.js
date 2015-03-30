var fs 				= require('fs');
var childProcess 	= require('child_process');
var extend 			= require('extend');

function Camera(config) {
	this.config = {
		camera: 'video0',
		frameRate: '5',
		resolution: '640x480',
		port: '8007'
	};
	this.initialize(config);
};

Camera.prototype.log = function(){
	console.log(this);
}
Camera.prototype.initialize = function(config) {
	extend(true, this.config, config);
}
Camera.prototype.startStreamServer = function(){
	var exec = childProcess.exec;
	var cmd = 'mjpg_streamer -i "input_uvc.so -d /dev/' + this.config.camera + ' -f ' + this.config.frameRate + ' -r ' + this.config.resolution + '"  -o "output_http.so -p ' + this.config.port + '"';
	exec(cmd);
	//mjpg_streamer -i "input_uvc.so -d /dev/video0 -f 30 -r 640x480"  -o "output_http.so -p 8007"
}
Camera.prototype.stopStreamerServer = function(cb){
	var exec = childProcess.exec;
    var cmd = 'killall mjpg_streamer';
    exec(cmd, function(err, stdout, stderr) {
	    cb(err);
	    console.log('server stoped');
    });
}
Camera.prototype.takeSnapshot = function(filename, cb){
	var exec = childProcess.exec;
	var cmd = 'wget http://127.0.0.1:' + this.config.port + '/?action=snapshot -O ' + filename;
	exec(cmd, function(err, stdout, stderr) {
	    cb(err);
	    console.log('snapshot done');
    });
}

module.exports = Camera;