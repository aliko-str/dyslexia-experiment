var util = require("util");
var classes = require("./classes.js");
var winston = require("winston");
var fs = require("fs");
var _ = require("underscore");
var mailer = require("./mailer.js");
var MAIL_INTERVAL = 1000*60*10; //milliseconds
var mailedLastTime = 0;

function Logger(_logFileName, _loggerName, _ifNotifyAdmin) {
	this.logger = new (winston.Logger)({
		'transports' : [new (winston.transports.File)({
			filename : process.env._dataDir + _logFileName,
			json : false,
			maxsize : 102400,
			maxFiles : 10
		})]
	});
	this.logger._logFileName = _logFileName;
	this.logger._loggerName = _loggerName;
	this.logger._ifNotifyAdmin = _ifNotifyAdmin;
	this.logger.on("error", function(err){
		return console.error("%s Logging '%s' errors: %s", _loggerName, _logFileName, err.toString());
	});
	this.log = log;
	this.getLogs = getLogs;
	this.deleteLogs = deleteLogs;
	return this;
}

function log(req, additString) {
	var logger = this.logger;
	var strToLog = "";
	if(!_.isString(req)){
	  var ipAddr = req.header("x-forwarded-for");
	  if (ipAddr){
	    var list = ipAddr.split(",");
	    ipAddr = list[list.length-1];
	  } else {
	    ipAddr = req.ip;
	  }
	  var shortUrl = req.originalUrl.substring(0, 256);
	  strToLog = util.format('\n\tMETHOD: %s \n\tHOST: %s \n\tURL: "%s"\n\t\IP %s;\n\tCLIENT %s\n', req.method, req.hostname, shortUrl, ipAddr, req.headers['user-agent']);
	}else{
		additString = req;
	}
	if(additString){
		strToLog = util.format("%s\tMSG: %s \n", strToLog, additString);
	}
	logger.info(strToLog);
	if(logger._ifNotifyAdmin){
		if(Date.now() - mailedLastTime > MAIL_INTERVAL){
			 mailedLastTime = Date.now();
			 this.getLogs(function(paramObj){
			 	var msgBody = "can't read logs.";
			 	if(paramObj.code === 200){
			 		msgBody = paramObj.data;
			 	}
			 	mailer.notifyAdmin(err, msgBody);
			 	return;
			 });
		}
	}
	return strToLog;
}

function getLogs(callback) {
	var logger = this.logger;
	var logFilePath = process.env._dataDir + logger._logFileName;
	return fs.readFile(logFilePath, function(err, data) {
		if(err) {
			console.error("%s couldn't read %s log file.", logger._loggerName, logger._logFileName);
			return callback(new classes.CallbackParam(500, null, "Couldn't read log file"));
		}
		return callback(new classes.CallbackParam(200, data, ""));
	});
}

function deleteLogs(callback){
	var logger = this.logger;
	var logFilePath = process.env._dataDir + logger_logFileName;
	return fs.truncate(logFilePath, 0, function(err) {
		if(err) {
			console.error("%s couldn't truncate %s log file.", logger._loggerName, logger._logFileName);
			return callback(new classes.CallbackParam(500, null, "Couldn't truncate log file"));
		}
		return callback(new classes.CallbackParam(200, {res: "allOk"}, ""));
	});
}

module.exports = {
	Logger: Logger
};
