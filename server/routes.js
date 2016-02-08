const _rootF = "../";
const path = require("path");
const helpDir = path.resolve(__dirname, "helpers");
const classes = require(path.join(helpDir, 'classes.js'));
const clientErrorLogger = require(path.join(helpDir, "client.error.logger.js"));
const clientFeedbackLogger = require(path.join(helpDir, "client.feedback.logger.js"));
const serverErrorLogger = require(path.join(helpDir, "server.error.logger.js"));
const _ = require("underscore");
const main = require("./main.js");
const settings = require("./settings.js");

function addRoutes(server) {
	function _ifActionFailed(paramObj, req, res) {
		var failed = false;
		if (paramObj.isErr()) {
			failed = true;
			if (paramObj.code >= 500) {
				serverErrorLogger.log(req, paramObj.message.toString().substring(0, 256));
				// res.redirect("/500");
				res.status(paramObj.code).set("Content-Type", "text/plain").send("We are confused... An error occured on the server.");
			} else if (paramObj.code >= 400) {
				res.redirect("/404");
				// res.send("The request contained a syntax error or asked a non-existing
				// resource.");
			} else {
				res.status(paramObj.code).set("Content-Type", "text/plain").send("Unrecognized Error");
			}
		}
		return failed;
	}
	var gets = {},
		posts = {},
		deletes = {};
	var routes = {
		"welcome": "/welcome/:lang?",
		"instr": "/instructions/:lang/:sessionId/:psyasp?",
		"instr2": "/instructions2/:lang/:sessionId/:psyasp?",
		"pre-training": "/pre.training/:lang/:sessionId/:psyasp?",
		"training": "/training/:lang/:sessionId/:psyasp?",
		"pre-eval": "/pre.evaluation/:lang/:sessionId/:psyasp?",
		"eval": "/evaluation/:lang/:sessionId/:psyasp?",
//		"results" : "/evaluation.results/:lang/:sessionId?",
		//		"emailme" : "/mail.results/:lang/:sessionId?",
		//		"feedback" : "/feedback/:sessionId?",
		"thanks": "/thanks/:lang/:sessionId?",
		//		"customFront": "/custom.front/:frontName?",
		//		"frontEditor": "/front.end.editor?",
		getReal: function (urlName, reqParams) {
			var resStr = this[urlName];
			Object.keys(reqParams).forEach(function (key) {
				resStr = resStr.replace(":" + key, reqParams[key]);
			});
			return resStr.replace("?", "/");
		}
	};

	gets["/strings/:lang/:main/tmp.js?"] = function (req, res) {
		function _codeWrapper(jsonStrings) {
			var cacheControl = process._debugMode ? "private, max-age=0, no-store, no-cache, must-revalidate" : 'public, max-age=' + (86400000 / 1000);
			if (!res.getHeader('Cache-Control')) {
				res.setHeader('Cache-Control', cacheControl);
			}
			var resBody = "window.App = window.App || {}; window.App.strings = window.App.strings || {}; window.App.strings['" + req.params.lang + "'] = " + jsonStrings + ";";
			if (req.params.main === "main") {
				resBody += "window.App.S = window.App.strings['" + req.params.lang + "'];";
			}
			res.status(200).send(resBody);
		}
		main.stringCache.getLocale((req.params.lang || "").toString().toLowerCase(), function (paramObj) {
			if (paramObj.isErr()) {
				if (req.params.lang.toLowerCase() == "en") {
					return res.redirect("/400");
				}
				return res.redirect(req.route.path.replace(":lang", "en").replace(":main", req.params.main));
			}
			_codeWrapper(paramObj.data);
		});
		return;
	};

	gets["/"] = function (req, res) {
		res.redirect("/choose.language");
	};

	gets["/choose.language?"] = function (req, res) {
		res.status(200).render("main.template.ejs", {
			CssHrefs: ["/css/choose.lang.main.css"],
			jsSrcs: ["/js/choose.lang.main.js"],
			_debug: process._debugMode,
			langs: ["en", "it"],
			appParams: JSON.stringify({
				nextPage: routes.welcome,
				reqParams: req.params
			})
		});
	};

	gets[routes.welcome] = function (req, res) {
		req.params.psyasp = settings.PSY_ASPECTS_NAMES[0];
		req.params.sessionId = main.generateSessionID();
		res.render("main.template.ejs", {
			CssHrefs: ["/css/message.css"],
			jsSrcs: ["/js/message.js", "/js/message.wlcm.js"],
			_debug: process._debugMode,
			langs: [req.params.lang],
			appParams: JSON.stringify({
				viewName: "welcome.ejs",
				nextPage: routes.getReal("instr", req.params),
				reqParams: req.params
			})
		});
	};

	gets[routes.instr] = function (req, res) {
		res.render("main.template.ejs", {
			CssHrefs: ["/css/message.css", "/css/message.instructions.css"],
			jsSrcs: ["/js/message.js"],
			_debug: process._debugMode,
			langs: [req.params.lang],
			appParams: JSON.stringify({
				viewName: "instructions.ejs",
				nextPage: routes.getReal("pre-training", req.params),
				reqParams: req.params,
				psyAsp: settings.PSY_ASPECTS_SETTINGS[req.params.psyasp]
			})
		});
	};

	gets[routes["pre-training"]] = function (req, res) {
		res.render("main.template.ejs", {
			CssHrefs: ["/css/message.css"],
			jsSrcs: ["/js/message.js"],
			_debug: process._debugMode,
			langs: [req.params.lang],
			appParams: JSON.stringify({
				viewName: "pre.training.ejs",
				nextPage: routes.getReal("training", req.params),
				reqParams: req.params,
				psyAsp: settings.PSY_ASPECTS_SETTINGS[req.params.psyasp]
			})
		});
	};

	function _theTest(stimuli, nextPage, postUrl, req, res) {
		res.render("main.template.ejs", {
			CssHrefs: ["/css/evaluation.css"],
			jsSrcs: ["/js/evaluation.js"],
			_debug: process._debugMode,
			langs: [req.params.lang],
			appParams: JSON.stringify({
				postUrl: postUrl,
				stimuli: stimuli,
				nextPage: nextPage,
				psyAsp: settings.PSY_ASPECTS_SETTINGS[req.params.psyasp],
				reqParams: req.params
			})
		});
	}
	gets[routes["training"]] = function (req, res) {
		var stimuli = [{
			id: "test1",
			codeName: "1.png"
		}, {
			id: "test2",
			codeName: "2.png"
		}, {
			id: "test3",
			codeName: "3.png"
		}];
		stimuli = stimuli.map(function (el) {
			el["url"] = "/trainstore/" + el["codeName"];
			return el;
		});
		_theTest(stimuli, routes.getReal("pre-eval", req.params), routes.getReal("training", req.params), req, res);
	};

	posts[routes["training"]] = function (req, res) {
		// we dont' save these data - just return 'success'
		res.status(200).send(JSON.stringify({
			resp: "Ok"
		}));
	};

	gets[routes["pre-eval"]] = function (req, res) {
		res.render("main.template.ejs", {
			CssHrefs: ["/css/message.css"],
			jsSrcs: ["/js/message.js"],
			_debug: process._debugMode,
			langs: [req.params.lang],
			appParams: JSON.stringify({
				viewName: "pre.evaluation.ejs",
				nextPage: routes.getReal("eval", req.params),
				reqParams: req.params,
				psyAsp: settings.PSY_ASPECTS_SETTINGS[req.params.psyasp]
			})
		});
	};

	gets[routes["eval"]] = function (req, res) {
		var nextUrl;
		const currInd = _.indexOf(settings.PSY_ASPECTS_NAMES, req.params.psyasp);
		if(currInd >= settings.PSY_ASPECTS_NAMES.length - 1){
			nextUrl = routes.getReal("thanks", req.params);
		}else{
			req.params.psyasp = settings.PSY_ASPECTS_NAMES[currInd + 1];
			nextUrl = routes.getReal("instr2", req.params)
		}
		main.selectImgForTest(function (paramObj) {
			if (!_ifActionFailed(paramObj, req, res)) {
				var stimuli = paramObj.data.map(function (el) {
					el["url"] = "/imgstore/" + el["codeName"];
					return el;
				});
				_theTest(stimuli, nextUrl, routes.getReal("eval", req.params), req, res);
			}
		});
	};

	gets[routes.instr2] = function (req, res) {
		res.render("main.template.ejs", {
			CssHrefs: ["/css/message.css", "/css/message.instructions.css"],
			jsSrcs: ["/js/message.js"],
			_debug: process._debugMode,
			langs: [req.params.lang],
			appParams: JSON.stringify({
				viewName: "instructions2.ejs",
				nextPage: routes.getReal("pre-eval", req.params),
				reqParams: req.params,
				psyAsp: settings.PSY_ASPECTS_SETTINGS[req.params.psyasp]
			})
		});
	};

	posts[routes["eval"]] = function (req, res) {
		main.saveTestRes(req.params.psyasp, req.params.sessionId, req.body, function (paramObj) {
			if (!_ifActionFailed(paramObj, req, res)) {
				res.status(200).send(JSON.stringify({
					resp: "Ok"
				}));
			}
		});
	};


	gets[routes["thanks"]] = function (req, res) {
		res.render("main.template.ejs", {
			CssHrefs: ["/css/message.css", "/css/thanks.css"],
			jsSrcs: ["/js/message.js", "/js/message.thanks.js"],
			_debug: process._debugMode,
			langs: [req.params.lang],
			appParams: JSON.stringify({
				emailed: req.params.emailed == "emailed" ? true : false,
				viewName: "thanks.ejs",
				nextPage: "/choose.language/",
				reqParams: req.params
			})
		});
	};

	(function _assign404() {
		var msgs = [];
		main.stringCache.getLangList(function (supportedLangs) {
			supportedLangs.forEach(function (lang) {
				main.stringCache.getString(lang, "_404", function (paramObj) {
					msgs.push(paramObj.data || "");
				});
			});
		});
		gets["/404"] = function (req, res) {
			res.status(400);
			if (req.accepts("html")) {
				return res.render("404.ejs", {
					msgs: msgs
				});
			}
			return res.set("Content-Type", "plain/text").send(msgs.join(". \n "));
		};
	})();

	(function _assign500() {
		var msgs = [];
		main.stringCache.getLangList(function (supportedLangs) {
			supportedLangs.forEach(function (lang) {
				main.stringCache.getString(lang, "_500", function (paramObj) {
					msgs.push(paramObj.data || "");
				});
			});
		});
		gets["/500"] = function (req, res) {
			res.status(500);
			if (req.accepts("html")) {
				return res.render("500.ejs", {
					msgs: msgs
				});
			}
			return res.set("Content-Type", "plain/text").send(msgs.join(". \n "));
		};
	})();

	clientErrorLogger.addRoutes(gets, posts);
	clientFeedbackLogger.addRoutes(gets, posts);

	return {
		gets: gets,
		posts: posts,
		deletes: deletes
	};
}

function getStaticRouteDict() {
	return {
		"/public": path.join(__dirname, "..", "client"),
		"/public.shared": path.join(__dirname, "..", 'client.code.shared'),
		"/imgstore": path.join(__dirname, "..", "data", "img"),
		"/trainstore": path.join(__dirname, "..", "data", "train")
	};
}

function getViewRouteArr() {
	return [path.join(__dirname, "tmpl")];
}

module.exports = {
	addRoutes: addRoutes,
	getStaticRouteDict: getStaticRouteDict,
	getViewRouteArr: getViewRouteArr
};
