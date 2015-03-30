var Cylon 			= require('cylon');
var express        	= require('express.io');
var bodyParser     	= require('body-parser');
var Camera			= require('./camera');
var app            	= express();
var routes			= require('./routes/snapshot')(app);
var facebook 		= require('./facebook');
var fs 				= require('fs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.http().io();


app.managerPanelMessage = function(message, message2) {
    app.sensors.display.clear();

    setTimeout(function(){
        app.sensors.display.setCursor(0,0);
        app.sensors.display.write(message);
        app.sensors.display.setCursor(1,0);
        app.sensors.display.write(message2);
	}, 10);
};

app.isprocessing = false;
app.takeSnapshot = function(){
	if(!app.isprocessing){
		
		app.isprocessing = true;
		
		clearTimeout(app.waitingTimeout);

		var bip = 0;
		var interval = setInterval(function(){
			
			if(bip == 0){
				app.io.broadcast('counting', {value: 0});
			}

			var value = (3 - bip);
			var str_value = (value == 0) ? 'JAAAAA' : (value + '');
			
			app.managerPanelMessage( str_value, '');
			app.sensors.buzzer.digitalWrite(1);

			bip++;

			setTimeout(function(){
				app.sensors.buzzer.digitalWrite(0);
			}, (bip == 4 ? 1000 : 100));
			
			if(bip == 4) {
				clearInterval(interval);
				
				var date = new Date();
				var filename = __dirname + '/public/snap/gdg_snapshot_' + date.toISOString() + '_' + (app.snap++) + '.jpg';
				
				app.sensors.camera.takeSnapshot(filename, function(err){
					if(!err) {
						
						app.io.broadcast('image', {status: 'OK'});

						facebook(filename, '#IoT #GDGSSA #IntelGalileo #SENAICIMATEC #JoinIoT #IntelMaker #SoftwareSENAI');

						app.sensors.camera.stopStreamerServer(function(err){
							if(err) {
								console.log('ops, mjpg_streamer stoped');
							}
							app.isWaitingPhoto = false;
						});

						setTimeout(function(){
							app.managerPanelMessage('FEITO!', '');
							setTimeout(function(){
								app.managerPanelMessage('VAMOS FAZER', 'UMA SELF?');
								app.isprocessing = false;
							}, 3000);
						}, 1500);
					} else {
						console.log('facebook error :(');
						app.managerPanelMessage('VAMOS FAZER', 'UMA SELF?');
						app.isprocessing = false;
					}
				});
			}

		}, 1000);	
	}
};

app.isWaitingPhoto = false;
app.waitingTimeout;
app.openStream = function() {
	if(!app.iswaitingaphoto) {
		
		app.isWaitingPhoto = true;
		
		app.sensors.camera.startStreamServer();

		app.managerPanelMessage('AGUARDANDO...', '');

		app.io.broadcast('startServer', {status: 'OK'});
		
		app.waitingTimeout = setTimeout(function(){
			
			app.sensors.camera.stopStreamerServer(function(err){
				if(err) {
					console.log('ops, o mjpg_streamer parou');
				}
			});

			app.managerPanelMessage('NADA DE FOTO...', '');

			setTimeout(function(){
				app.managerPanelMessage('VAMOS FAZER', 'UMA SELF?');
				app.isWaitingPhoto = false;
			}, 2000);

		}, 60000);
	}
};

app.checkAction = function() {
	if(!app.isWaitingPhoto)
	{
		app.openStream();
	} else {
    	app.takeSnapshot();	
	}
}

Cylon.robot({
  connections: {
    galileo: { adaptor: 'intel-iot' }
  },
  devices: {
  	display: {driver: 'upm-jhd1313m1'},
  	buzzer: {driver: 'direct-pin', pin: 3},
  	button: {driver: 'button', pin: 2}
  },
  work: function(robot) {
  	app.snap = 0;
    app.sensors = {
    	display: robot.display,
    	buzzer: robot.buzzer,
    	button: robot.button,
    	camera: new Camera({frameRate: 15, resolution: '1280x720'})
    };

    app.use('/snapshot', routes);
    app.managerPanelMessage('VAMOS FAZER', 'UMA SELF?');

    app.sensors.button.on('release', function() {
    	app.checkAction();
    });

    app.listen(8087, function(){
    	console.log("Listening on port 8087");

    	app.sensors.buzzer.digitalWrite(1);

		setTimeout(function(){
			app.sensors.buzzer.digitalWrite(0);
		}, 100);
    });
  }
}).start();

process.on( 'SIGINT', function() {
	app.sensors.camera.stopStreamerServer();
  	
  	console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );

  	process.exit( );
})