var https = require('https'); 
var fs = require('fs'); 
var FormData = require('form-data'); 

function postPhotoToFanPage(filename, message){
	var ACCESS_TOKEN = "";
 
	var form = new FormData(); //Create multipart form
	form.append('file', fs.createReadStream(filename)); //Put file
	form.append('message', message); //Put message
	 
	 console.log(filename);

	//POST request options, notice 'path' has access_token parameter
	var options = {
	    method: 'post',
	    host: 'graph.facebook.com',
	    path: '/me/photos?access_token='+ACCESS_TOKEN,
	    headers: form.getHeaders(),
	}
	 
	//Do POST request, callback for response
	var request = https.request(options, function (res){
	     console.log('facebook ok');
	});
	 
	//Binds form to request
	form.pipe(request);
	 
	//If anything goes wrong (request-wise not FB)
	request.on('error', function (error) {
	     console.log(error);
	});
}

module.exports = postPhotoToFanPage;
