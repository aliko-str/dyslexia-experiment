var classes = require("./classes.js");
var winston = require("winston");
var util = require("./util.js");
var fs = require("fs");
var logger;

function _init() {
	logger = new (winston.Logger)({
		'transports' : [new (winston.transports.File)({
			filename : process.env._dataDir + 'complaints.log',
			json : false,
			maxsize : 1024000,
			maxFiles : 1
		})]
	});
	return logger.on("error", function(err){
		return console.error("#UgdvE Logging 'cantdo' errors: " + err.toString());
	});
}

function addRoutes(gets, posts) {
	(logger || _init());
	posts["/api/cantdo?"] = function(req, res) {
		res.setHeader('Content-Type', 'text/plain');
		res.send("Thanks!");
		if(req.body) {
			var appCode = req.body.appCode.toString().substring(0, 64);
			var message = req.body.reason.toString().substring(0, 512);
		  var ipAddr = req.header("x-forwarded-for");
		  if (ipAddr){
		    var list = ipAddr.split(",");
		    ipAddr = list[list.length-1];
		  } else {
		    ipAddr = req.ip;
		  }
			logger.info('\n\tAPP %s\n\tMESSAGE: "%s"\n\tFROM %s;\n\tCLIENT\ %s', appCode, message, ipAddr, req.headers['user-agent']);
		}
	};
	return;
}

function getLogs(callback) {
	(logger || _init());
	var logFilePath = process.env._dataDir + "complaints.log";
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
	var logFilePath = process.env._dataDir + "complaints.log";
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
