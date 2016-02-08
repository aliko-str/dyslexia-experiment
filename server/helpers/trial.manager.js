var classes = require("./classes.js");
var crypto = require("./crypto.js");

var sessionStates = {
	"0" : "not started yet",
	"1" : "in progress",
	"2" : "finished"
};

var notFoundCallback = function(callback) {
	//anti DoS delay
	setTimeout(function() {
		callback(new classes.CallbackParam(400, null, "This trial ID either doesn't exist or already expired."));
	}, 500);
};

var _dbErrorShortCut = function(db, sql, err, releaseFunc, callback) {
	db.error(sql, err);
	if(releaseFunc){
		releaseFunc();
	}
	return callback(new classes.CallbackParam(500, null, "There was an issue. It is noted and being investigated."));
};

function validateTrial(db, trialId, callback) {
	if(!trialId) {
		return notFoundCallback(callback);
	}
	return db.getConnection(function(paramObj, releaseFunc) {
		if(paramObj.code != 200) {
			callback(paramObj);
		} else {
			var conn = paramObj.data.connection;
			var sql = "SELECT * FROM ?? WHERE ?? = ?";
			sql = db.format(sql, ['trials', 'trialId', trialId]);
			conn.query(sql, function(err, results) {
				releaseFunc();
				if(err) {
					return _dbErrorShortCut(db, sql, err, releaseFunc, callback);
				} else {
					if(results.length === 1) {
						if(results[0].state === 1) {
							callback(new classes.CallbackParam(200, {
								checkedTrialId : trialId
							}, ""));
						} else if(results[0].state === 2) {
							callback(new classes.CallbackParam(300, {
								checkedTrialId : trialId
							}, "The session " + trialId + " has already finished."));
						} else {
							db.error(sql, "Validate trial id error. The trial either hasn't started. -- the state: " + sessionStates[results[0].state.toString()]);
							notFoundCallback(callback);
						}
					} else {
						db.error(sql, "Validate trial id error: there is no pre-stored session with id: " + trialId);
						notFoundCallback(callback);
					}
				}
				return;
			});
		}
	});
}

function startTrial(db, trialId, callback) {
	if(!trialId) {
		return notFoundCallback(callback);
	}
	var sql = "SELECT * FROM trials WHERE trialId = ?";
	sql = db.format(sql, [trialId]);
	return db.execute(sql, function(paramObj) {
		if(paramObj.code !== 200) {
			return _dbErrorShortCut(db, sql, paramObj.message, null, callback);
		}
		var results = paramObj.data;
		if(results.length) {
			if(results[0].state === 2) {
				return callback(new classes.CallbackParam(300, {}, "Already finished trialID - redirect to the confirmation page"));
			} else {
				sql = "UPDATE trials SET state = 1 WHERE trialId = ?";
				sql = db.format(sql, [trialId]);
				db.execute(sql, function(paramObj) {
					if(paramObj.code !== 200) {
						return _dbErrorShortCut(db, sql, paramObj.message, null, callback);
					}
					return callback(new classes.CallbackParam(200, {}, null));
				});
			}
		} else {
			console.log("#pEniP");
			notFoundCallback(callback);
		}
	});
}

//callback gets confirmation code as data
function finishTrial(db, trialId, callback) {
	if(!trialId) {
		return notFoundCallback(callback);
	}
	return db.getConnection(function(paramObj, releaseFunc) {
		if(paramObj.code !== 200) {
			callback(paramObj);
		} else {
			var conn = paramObj.data.connection;
			var sql = "SELECT * FROM ?? WHERE ?? = ?";
			sql = db.format(sql, ["trials", "trialId", trialId]);
			conn.query(sql, function(err, rows) {
				if(err) {
					return _dbErrorShortCut(db, sql, err, releaseFunc, callback);
				} else {
					if(rows.length != 1) {
						var err = "The number of rows: " + rows.length;
						return _dbErrorShortCut(db, sql, err, releaseFunc, callback);
					} else {
						var sql = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
						sql = db.format(sql, ['trials', 'state', 2, "trialId", trialId]);
						conn.query(sql, function(err, results) {
							releaseFunc();
							if(err) {
								return _dbErrorShortCut(db, sql, err, releaseFunc, callback);
							} else {
								callback(new classes.CallbackParam(200, {
									confirmationCode : rows[0].code
								}, null));
							}
						});
					}
				}
			});
		}
	});
}

function createOneMicroWorkerTrial(db, trialId, workerId, callback) {
	var sql = "SELECT * FROM trials WHERE trialId = ?";
	sql = db.format(sql, [trialId]);
	return db.execute(sql, function(paramObj) {
		if(paramObj.code !== 200) {
			return callback(paramObj);
		}
		if(!paramObj.data.length) {
			sql = "INSERT INTO trials (trialId, code, state, workerId) VALUES (?,?,0,?)";
			var confirmationCode = crypto.generateMicroWorkerVCode(trialId);
			sql = db.format(sql, [trialId, confirmationCode, workerId]);
		} else if(paramObj.data[0].state === 2) {
			return callback(new classes.CallbackParam(200, null, ""));
			//return notFoundCallback(callback);
		} else if(paramObj.data[0].state === 0) {
			return callback(new classes.CallbackParam(200, null, ""));
		} else {
			sql = "UPDATE trials SET state=0 WHERE trialId = ?";
			sql = db.format(sql, [trialId]);
		}
		db.execute(sql, callback);
	});
}

module.exports = {
	init : function(dbuser) {
		var db = require("./db.js").init(dbuser);
		return {
			validateTrial : function(trialId, callback) {
				validateTrial(db, trialId, callback);
			},
			startTrial : function(trialId, callback) {
				startTrial(db, trialId, callback);
			},
			finishTrial : function(trialId, callback) {
				finishTrial(db, trialId, callback);
			},
			createOneMicroWorkerTrial : function(workerId, campaignId, randKey, callback) {
				if(!workerId) {
					console.log("#p7sLd No worker id");
					callback(new classes.CallbackParam(400, null, "Bad request: worker ID is missing."));
					return null;
				}
				workerId = workerId.toString();
				if(workerId.indexOf("notcrowdbasedrun") > -1) {
					var _tmpSalt = Math.floor(Math.random() * 9007199254740991).toString();
					campaignId = campaignId || _tmpSalt;
					randKey = randKey || _tmpSalt;
				}
				campaignId = campaignId || "";
				randKey = randKey || "";
				trialId = (campaignId + workerId + randKey).substring(0, 63);
				createOneMicroWorkerTrial(db, trialId, workerId, callback);
				return trialId;
			}
		};
	}
};
