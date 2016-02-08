var Logger = require("./generic.logger.js").Logger;
var _ = require("underscore");

var settings = {
	MAX_FEEDBACK_PER_IP : 10
};

// TODO later, make logging smarter: set MAX_FEEDBACK_PER_IP for a time slice +
// keep ips in a database + filter out ips after the time slice

function RouteLogger(_logFileName, _loggerName, _ifNotifyAdmin, _postRouteToListen, expressApp) {
	_.extend(this, new Logger(_logFileName, _loggerName, _ifNotifyAdmin));
	addRoutes(_postRouteToListen, expressApp, this);
	return this;
}
function addRoutes(_postRouteToListen, expressApp, self) {
	expressApp.post(_postRouteToListen, function(req, res) {
		res.set('Content-Type', 'application/json');
		res.send(JSON.stringify({
			res : "Noted!"
		}));
		var msg = "";
		if(req.body && req.body.msg) {
			msg = req.body.msg;
		}
		console.log(JSON.stringify(req.body, null, 4));
		return self.log(req, msg);
	});
	return;
}

module.exports = {
	RouteLogger : RouteLogger
};
