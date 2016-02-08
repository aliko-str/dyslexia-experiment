var classes = require("./classes.js");
var winston = require("winston");
var fs = require("fs");
var logger;
var _logFileName = 'client.error.log';

function _init() {
	logger = new (winston.Logger)({
		'transports' : [new (winston.transports.File)({
			filename : process.env._dataDir + _logFileName,
			json : false,
			maxsize : 1024000,
			maxFiles : 1
		})]
	});
	return logger.on("error", function(err){
		return console.error("#UgdvE Logging 'client.error' errors: " + err.toString());
	});
}

function addRoutes(gets, posts, deletes) {
	(logger || _init());
	posts["/api/client.error?"] = function(req, res) {
		res.set('Content-Type', 'application/json');
		res.send(JSON.stringify({res:"Noted!"}));
		var err, errorOriginPage;
		if(req.body) {
			err = req.body.error;
			errorOriginPage = req.body.errorOriginPage;
		}
		return _log(req, errorOriginPage, err);
	};
	return;
}

function _log(req, errorOriginPage, err) {
  var ipAddr = req.header("x-forwarded-for");
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length-1];
  } else {
    ipAddr = req.ip;
  }
  var shortUrl = errorOriginPage.substring(0, 256);
  var shortErr = (err.message || err).toString().substring(0, 256);
	return logger.info('\n\tURL: "%s"\n\tFROM %s;\n\tCLIENT %s;\n\tERROR %s\n\n', errorOriginPage, ipAddr, req.headers['user-agent'], shortErr);
}

function getLogs(callback) {
	(logger || _init());
	var logFilePath = process.env._dataDir + _logFileName;
	return fs.readFile(logFilePath, function(err, data) {
		if(err) {
			console.error("#Q5v8X couldn't read Complaints log file.");
			return callback(new classes.CallbackParam(500, null, "Couldn't read log file"));
		}
		return callback(new classes.CallbackParam(200, data, ""));
	});
}

function deleteLogs(callback){
	(logger || _init());
	var logFilePath = process.env._dataDir + _logFileName;
	return fs.truncate(logFilePath, 0, function(err) {
		if(err) {
			console.error("#Vff7F couldn't truncate Complaints log file.");
			return callback(new classes.CallbackParam(500, null, "Couldn't truncate log file"));
		}
		return callback(new classes.CallbackParam(200, {res: "allOk"}, ""));
	});
}

module.exports = {
	addRoutes : addRoutes,
	getLogs : getLogs,
	deleteLogs: deleteLogs
};
