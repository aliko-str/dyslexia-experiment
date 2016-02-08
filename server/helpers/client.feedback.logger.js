var classes = require("./classes.js");
var util = require("./util.js");
var Logger = require("./generic.logger.js").Logger;
var logger;
var settings = {
	MAX_FEEDBACK_PER_IP: 10
};

// TODO later, make logging smarter: set MAX_FEEDBACK_PER_IP for a time slice + keep ips in a database + filter out ips after the time slice
var ipStore = {};

function _init() {
	logger = new Logger("feedback.tLightVC.SS.log", __filename);
}

function addRoutes(gets, posts) {
	(logger || _init());
	posts["/api/cantdo?"] = function(req, res) {
		res.setHeader('Content-Type', 'text/plain');
		res.send("Thanks!");
		if(req.body) {
		  var ipAddr = req.header("x-forwarded-for");
		  if (ipAddr){
		    var list = ipAddr.split(",");
		    ipAddr = list[list.length-1];
		  } else {
		    ipAddr = req.ip;
		  }
		  if(!ipStore[ipAddr.toString()]){
		  	ipStore[ipAddr.toString()] = 1;
		  }
		  if(ipStore[ipAddr.toString()] > settings.MAX_FEEDBACK_PER_IP){
		  	// TODO do something more meaningful
				logger.log(req, "TOO much feedback fromt one ip");
		  }else{
				var appCode = req.body.appCode.toString().substring(0, 64);
				var message = req.body.reason.toString().substring(0, 512);
				var additInfo = util.format('\n\tAPP %s\n\tMESSAGE: "%s"', appCode, message);
				logger.log(req, additInfo);
		  }
		}
	};
	return;
}

function getLogs(callback) {
	(logger || _init());
	return logger.getLogs(callback);
}

function deleteLogs(callback){
	(logger || _init());
	return logger.deleteLogs(callback);
}

module.exports = {
	addRoutes : addRoutes,
	getLogs : getLogs,
	deleteLogs: deleteLogs
};
