const Logger = require("./generic.logger.js").Logger;
const RouteLogger = require("./generic.route.logger.js").RouteLogger;
const _ = require("underscore");

const loggers = {
	NotFound : _.partial(Logger, "not.found.log", "notFound", false),
	Requests: _.partial(Logger, "requests.log", "allRequests", false),
	ServerError: _.partial(Logger, "server.errors.log", "serverErrors", true)
};

const routeLoggers = {
	ClientError: _.partial(RouteLogger, "client.error.log", "clientError", false),
	ClientFeedback: _.partial(RouteLogger, "client.feedback.log", "clientFeedback", false)
};

module.exports = {
	loggers: loggers,
	routeLoggers: routeLoggers
};
