var classes = require("./classes.js");
var winston = require("winston");
var fs = require("fs");
var logger;
var _logFileName = 'server.errors.log';

var mailer = require("./mailer.js");
var MAIL_INTERVAL = 1000*60*10; //milliseconds
var mailedLastTime = 0;

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
		return console.error("%s Logging '%s' errors: %s", __filename, _logFileName, err.toString());
	});
}

function log(req, err) {
	(logger || _init());
  var ipAddr = req.header("x-forwarded-for");
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length-1];
  } else {
    ipAddr = req.ip;
  }
  var shortUrl = req.originalUrl.substring(0, 256);
	logger.info('\n\tURL: "%s"\n\tFROM %s;\n\tCLIENT %s\n\tSERVER_ERROR: %s\n', shortUrl, ipAddr, req.headers['user-agent'], err.message || err.toString());
	if(Date.now() - mailedLastTime > MAIL_INTERVAL){
		 mailedLastTime = Date.now();
		 this.getLogs(function(paramObj){
		 	if(paramObj.code === 200){
		 		mailer.notifyMeAboutAnError(err, paramObj.data);
		 	}
		 	return;
		 });
	}
	return;
}

function getLogs(callback) {
	(logger || _init());
	var logFilePath = process.env._dataDir + _logFileName;
	return fs.readFile(logFilePath, function(err, data) {
		if(err) {
			console.error("%s couldn't read %s log file.", __filename, _logFileName);
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
			console.error("%s couldn't truncate %s log file.", __filename, _logFileName);
			return callback(new classes.CallbackParam(500, null, "Couldn't truncate log file"));
		}
		return callback(new classes.CallbackParam(200, {res: "allOk"}, ""));
	});
}

module.exports = {
	log : log,
	getLogs : getLogs,
	deleteLogs: deleteLogs
};
