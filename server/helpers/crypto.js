var crypto = require('crypto');

var microWorkerKey = "33869468e6b8bea1689d72cf945c32d30bf275f0db69a671f74a02a4a50774d6";
var url2PngSecretKey = "SB54B4C78CF584";
var url2PngApiKey = "P5278716E2F2F9";


function generateMicroWorkerVCode(trialId){
  var shasum = crypto.createHash('sha256');
  var dataToHash = trialId + microWorkerKey;
  shasum.update(dataToHash);
  var result = "mw-" + shasum.digest("hex");
  return result;
}

function _generateUrl2PngHash(urlQueryStr){
	var md5hash = crypto.createHash("md5");
	md5hash.update(urlQueryStr + url2PngSecretKey);
	return md5hash.digest("hex");
	//return md5hash.digest("base64");
}

function generateUrl2PngRequestUrl(urlQueryStr){
	return "http://api.url2png.com/v6/" + url2PngApiKey + "/" + _generateUrl2PngHash(urlQueryStr) + "/png/?" + urlQueryStr;
}

module.exports = {
  generateMicroWorkerVCode: generateMicroWorkerVCode,
  generateUrl2PngRequestUrl: generateUrl2PngRequestUrl
};
