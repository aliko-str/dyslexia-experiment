var db = require("./db.js").init("crowdGuiCollector");
var classes = require("./classes.js");

function saveGoldData(dbUser, trialId, goldData, callback) {
  if (!(goldData.numOfGolds && goldData.numOfAttempts)) {
    console.error("#vgJuv gold data isn't valid: %j", goldData);
    return callback(new classes.CallbackParam(400, null, "There is nothing to save..."));
  }
  var sql = "SELECT * FROM gold WHERE trialId=?";
  sql = db.format(sql, [trialId]);
  return db.execute(sql, dbUser, function(paramObj) {
    if (paramObj.code !== 200) {
      return callback(paramObj);
    }
    var res = paramObj.data;
    sql = "REPLACE INTO gold (trialId, numOfGolds, numOfAttempts) VALUES (?,?,?)";
    if (res.length) {
      sql = db.format(sql, [trialId, goldData.numOfGolds + res[0].numOfGolds, goldData.numOfAttempts + res[0].numOfAttempts]);
    }
    else {
      sql = db.format(sql, [trialId, goldData.numOfGolds, goldData.numOfAttempts]);
    }
    db.execute(sql, dbUser, function(paramObj) {
      if (paramObj.code !== 200) {
        return callback(paramObj);
      }
      return callback(new classes.CallbackParam(200, {message: "allOk"}, ""));
    });
  });
}

module.exports = {
  saveGoldData : saveGoldData
};
