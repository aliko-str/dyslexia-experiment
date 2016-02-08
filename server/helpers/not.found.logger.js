var classes = require("./classes.js");
var util = require("./util.js");
var Logger = require("./generic.logger.js").Logger;
var logger;

function _init() {
	logger = new Logger("not.found.log", __filename);
}

function log(req) {
	(logger || _init());
	return logger.log(req, "");
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
	log : log,
	getLogs : getLogs,
	deleteLogs: deleteLogs
};
