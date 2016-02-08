const _rootF = "..";
const path = require("path");
const helpDir = path.resolve(__dirname, "helpers");
var express = require('express');
var http = require("http");
var errorhandler = require("errorhandler");
var bodyParser = require('body-parser');
var requestLogger = require(path.join(helpDir, "request.logger.js"));
var notFoundLogger = require(path.join(helpDir, "not.found.logger.js"));
var serverErrorLogger = require(path.join(helpDir, "server.error.logger.js"));
var ejs = require("ejs");
var compression = require('compression');
var _ = require("underscore");
const routes = require("./routes.js");

var aServer = function() {
	var self = this;

	self._terminator = function(sig) {
		if( typeof sig === "string") {
			console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
			process.exit(1);
		}
		console.log('%s: Node server stopped.', Date(Date.now()));
	};

	self._setupTerminationHandlers = function() {
		//  Process on exit and signals.
		process.on('exit', function() {
			self._terminator();
		});

		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'].forEach(function(element, index, array) {
			process.on(element, function() {
				self._terminator(element);
			});
		});
	};

	self._initializeServer = function() {
		var cacheFor = process._debugMode?0:86400000;

		self.app = express();
		self.app.use(compression());
		self.app.use(bodyParser());

		var dynRouteArr = routes.addRoutes(self);
		var statRouteDict = routes.getStaticRouteDict();

		var viewRoutes = routes.getViewRouteArr();
		viewRoutes.push(process.cwd() + '/views');
		self.app.set("views", viewRoutes);
		self.app.set("view cache", !process._debugMode);
		self.app.set("view engine", "ejs");

		for(var statRout in statRouteDict) {
			self.app.use(statRout, express.static(statRouteDict[statRout], {maxAge: cacheFor}));
		}

		for(var r in dynRouteArr.gets) {
			self.app.get(r, (function(r, func) {
				return function(req, res) {
					requestLogger.log(req, "GET");
					return func(req, res);
				};
			})(r, dynRouteArr.gets[r]));
		}
		for(var r in dynRouteArr.posts) {
			self.app.post(r, (function(r, func) {
				return function(req, res) {
					requestLogger.log(req, "POST");
					return func(req, res);
				};
			})(r, dynRouteArr.posts[r]));
		}
		for(var r in dynRouteArr.deletes) {
			self.app["delete"](r, dynRouteArr.deletes[r]);
		}
		self.app.use(function(req, res, next) {
			notFoundLogger.log(req);
			return res.redirect("/404");
		});

		if(process._debugMode) {
			self.app.use(errorhandler());
			self.app.disable('view cache');
		} else {
			self.app.use(function(err, req, res, next) {
				serverErrorLogger.log(req, err.toString().substring(0, 256));
				res.redirect("/500");
				return;
			});
		}
	};

	self.init = function(port, ip, debugApp) {
		self.port = port;
		self.ipaddress = ip;
		// self._setupVariables();
		self._setupTerminationHandlers();
		self._initializeServer();
		self.app.set("ip", ip);
		self.app.set("port", port);
		return self;
	};
};

module.exports = new aServer();
