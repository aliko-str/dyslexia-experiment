var http = require("http");
var util = require("./util.js");
var classes = require("./classes.js");
var db = require("./db.js").init("crowdGuiCollector");

var services = {
  "freegeoip" : "http://freegeoip.net/json/<%ip%>",
  "ipinfo" : "http://ipinfo.io/<%ip%>/json"
};

function _saveGeoInfo(dbUser, trialId, geoInfo) {
  return db.getConnection(dbUser, function(paramObj, releaseFunc) {
    if (paramObj.code == 200) {
      var conn = paramObj.data.connection;
      var sql = "REPLACE INTO autoData (trialId, workerCountry, workerRegion, workerCity, workerIp) VALUES (?,?,?,?,?)";
      sql = db.format(sql, [trialId, geoInfo.country, geoInfo.region, geoInfo.city, geoInfo.ip]);
      conn.query(sql, function(err, res) {
        releaseFunc();
        if (err) {
          db.error(sql, err);
        }
      });
    }
  });
}

function getAndSaveGeoInfo(req, dbUser) {
  if(!req.query.trialId){
    return console.error("#7ucVA Can't save geoInfo - there is no trialId attached");
  }
  var ipAddr = req.header("x-forwarded-for");
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length-1];
  } else {
    ipAddr = req.ip;
  }
  var ipServiceUrl = util.interpolate(services["ipinfo"], {
    ip : ipAddr
  });
  http.get(ipServiceUrl, function(res) {
    if(res.statusCode < 300 && res.statusCode > 199){
      res.setEncoding('utf8');
      var responseParts = [];
      res.on("data", function(chunk) {
        responseParts.push(chunk);
      });
      res.on("end", function() {
        var data = JSON.parse(responseParts.join(''));
        if (data && data.ip && (data.country || data.country_code)) {
          var geoInfo = new classes.GeoInfo(data.ip, (data.country_code || data.country), (data.region || data.region_name), data.city);
          return _saveGeoInfo(dbUser, req.query.trialId, geoInfo);
        }
        console.error("#kR88d Geo Info wasn't correct: %j", data);
        return null;
      });
    }else{
      console.error("#H2vCz Tried to ask for geo information - external server didn't want to reply");
    }
  }).on("error", function(err) {
    console.error("#LnZrL Couldn't find out the country based on IP: %s", err.message);
  });
}

module.exports = {
  getAndSaveGeoInfo : getAndSaveGeoInfo
};
