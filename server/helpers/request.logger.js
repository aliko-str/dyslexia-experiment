var classes = require("./classes.js");
var winston = require("winston");
var fs = require("fs");
var logger;
var _logFileName = 'requests.log';

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
		return console.error("#Yacl3 Logging 'requests' errors: " + err.toString());
	});
}

function log(req, reqType) {
	(logger || _init());
  var ipAddr = req.header("x-forwarded-for");
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length-1];
  } else {
    ipAddr = req.ip;
  }
  var shortUrl = req.originalUrl.substring(0, 256);
  return logger.info("%s\n\tFROM %s;\n\tCLIENT\ %s\n\tTO %s", reqType, ipAddr, req.headers['user-agent'], shortUrl);
}

function getLogs(callback) {
	(logger || _init());
	var logFilePath = process.env._dataDir + _logFileName;
	return fs.readFile(logFilePath, function(err, data) {
		if(err) {
			console.error("#Q5v8X couldn't read Requests log file.");
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
			console.error("#Vff7F couldn't truncate Requests log file.");
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
