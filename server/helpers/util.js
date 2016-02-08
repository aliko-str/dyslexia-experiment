var interpolate = function(s, o) {
  s = s.toString();
  return s.replace(/<%([\w]*)%>/g, function(a, b) {
    var r = o[b];
    return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
};

var sqlEscape = function(s) {
  s = s.toString();
  return s.replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
};

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

var regexps = {};
regexps._email = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
regexps._url = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;

var validateUrl = function(urlStr){
	return regexps._url.exec(urlStr);
};

var getBaseUrl = function(urlStr){
	var validationRes = regexps._url.exec(urlStr);
	if(!validationRes) {
		return null;
	}
	var thisBaseUrlArr = validationRes[1].split(".");
	var thisBaseUrl = thisBaseUrlArr[thisBaseUrlArr.length - 2] + "." + thisBaseUrlArr[thisBaseUrlArr.length - 1];
	if(thisBaseUrlArr[thisBaseUrlArr.length - 2].length < 4 && thisBaseUrlArr[thisBaseUrlArr.length - 3]){
		thisBaseUrl = thisBaseUrlArr[thisBaseUrlArr.length - 3] + "." + thisBaseUrl;
	}
	return thisBaseUrl;
};

var getOurAppBaseUrl = function(){
	return process._productionMode?"http://atw-lab.com":"http://127.0.0.1:8081";
};

var _extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

var util = require("util");
util.interpolate = interpolate;
util.sqlEscape = sqlEscape;
util.shuffle = shuffle;
util.validateUrl = validateUrl;
util.getBaseUrl = getBaseUrl;
util.getOurAppBaseUrl = getOurAppBaseUrl;
util._extend = util._extend || _extend;

module.exports = util;
