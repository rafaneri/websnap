var express = require('express');
var router = express.Router();

module.exports = function(app){
	router.get('/take', function(req, res) {
	  app.checkAction();
	  res.status(200).send('OK');
	});

	return router;
};