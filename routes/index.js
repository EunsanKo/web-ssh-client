var fs = require('fs'),
    request = require('request');



exports.index = function(req, res){

	res.render('index.html');
	

};


exports.naver = function(req, res) {
	
	var uri = "http://www.naver.com";

	request(uri, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			
			res.send(body);
		}
	});	
	

};


exports.daumNate = function(req, res) {

	
	var uri = "http://www.daum.net";

	request(uri, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			
			res.send(body);
		}
	});
}


exports.zoom = function(req, res) {
	var uri = "http://search.zum.com/search.zum?method=uni&option=accu&qm=f_typing.top&query="

	request(uri, function (error, response, body) {
		if (!error && response.statusCode == 200) {
	
			res.send(body);
		}
	});
	
}