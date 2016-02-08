var mysql = require('mysql');
var classes = require("./classes.js");
var util = require("util");

var _localOptions = {
	'host' : "localhost",
	'user' : "root",
	'password' : "",
};

var _userSpecificOptions = {
	"crowdTester" : {
		'user' : "likingTester",
		'password' : "",
		//'password' : "traZtuaC805",
		'host' : "127.11.103.2",
		'port' : 3306,
		'connectionLimit' : 10,
		'queueLimit' : 100,
		'database' : "competecompare"
	},
	"crowdGuiCollector" : {
		'user' : 'crowdGuiReceiver',
		'password' : "",
		//'password' : 'tratatamcrowdgui',
		'host' : '127.11.103.2',
		'port' : '3306',
		'database' : 'crowdguis',
		'connectionLimit' : 10,
		'queueLimit' : 100
	},
	"designAnalyzer" : {
		'user' : 'designAnalyzer',
		'password' : "",
		'host' : '127.11.103.2',
		'port' : '3306',
		'database' : 'designfeatures',
		'connectionLimit' : 10,
		'queueLimit' : 100
	},
	"spazioD" : {
		'user' : 'spaziod',
		'password' : "",
		'host' : '127.11.103.2',
		'port' : '3306',
		'database' : 'spaziod',
		'connectionLimit' : 10,
		'queueLimit' : 100
	},
	"spazioD_test" : {
		'user' : 'spaziod',
		'password' : "",
		'host' : '127.11.103.2',
		'port' : '3306',
		'database' : 'spaziod_test',
		'connectionLimit' : 10,
		'queueLimit' : 100
	}
};

var pools = {};

(function moduleInit() {
	if( typeof process.env.OPENSHIFT_NODEJS_IP === "undefined") {
		for(var j in _userSpecificOptions) {
			for(var i in _localOptions) {
				_userSpecificOptions[j][i] = _localOptions[i];
			}
		}
	}
	for(var j in _userSpecificOptions) {
		pools[j] = mysql.createPool(_userSpecificOptions[j]);
	}
})();

// simply for convenient error reporting
var error = function(sql, err, callback) {
	var msg = "There was an issue. It is noted and being investigated.";
	if(process._debugMode){
		msg = util.format("#v5SVE DB error. Query: %s --> Error: %j, %s", sql, err, err.toString());
	}
	if(callback){
		callback(new classes.CallbackParam(500, null, msg));
	}
};

// callback takes two params: Classes.CallbackParam and a connection-release
// function
function getConnection(pool, callback) {
	return pool.getConnection(function(err, connection) {
		if(err) {
			error("<no sql> Couldn't get connection", err);
			callback(new classes.CallbackParam(500, null, err));
		} else {
			callback(new classes.CallbackParam(200, {
				connection : connection
			}, ""), function(connection) {
				return function() {
					return connection.release();
				};
			}(connection));
		}
	});
}

module.exports = {
	init : function(defaultDbName) {
		if(!defaultDbName) {
			throw error("", "No user was selected...");
		}
		var _moduleCopy = {
			mysql: mysql,
			_defaultDbName : defaultDbName,
			getConnection : function(userName, callback) {
				var pool;
				if( typeof (userName) == 'function') {
					pool = pools[this._defaultDbName];
					callback = userName;
				} else {
					if(pools[userName]) {
						pool = pools[userName];
					} else {
						error("", "Unknown user name: " + userName);
						callback(new classes.CallbackParam(500, null, "#8Uckc something went wrong..."));
					}
				}
				return getConnection(pool, callback);
			},
			error : error,
			format : function(sqlStr, args) {
				return this.mysql.format(sqlStr, args);
			},
			// 'execute' may not have the 'userName' param
			// the callback takes only one parameter of CallbackParam type
			execute: function(querySql, userName, callback){
				if( typeof (userName) == 'function') {
					callback = userName;
					userName = this._defaultDbName;
				}
				var extThis = this;
				this.getConnection(userName, function(params, releaseF){
					if(params.code !== 200){
						return callback(params);
					}
					params.data.connection.query(querySql, function(err, res){
						releaseF();
						if(err){
							return extThis.error(querySql, err, callback);
						}
						return callback(new classes.CallbackParam(200, res, ""));
					});
				});
			}
		};
		return _moduleCopy;
	}
};
