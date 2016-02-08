var fs = require("fs");
var csv = require("fast-csv");
var Q = require("q");
var _ = require("underscore");

function _validateUrl(url) {
	regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|(www\\.)?){1}([0-9A-Za-z-\\.@:%_\‌​+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
	return regex.test(url);
}

function _getBaseUrl(url) {
	regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|(www\\.)?){1}([0-9A-Za-z-\\.@:%_\‌​+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
	var baseUrl = regex.exec(url);
	if(!baseUrl) {
		return null;
	}
	return baseUrl[5] + baseUrl[6];
}

function getContractOfObj() {
	var contract = [];
	var recursiveContractExtract = function(prefix, thisPointer) {
		for(var i in thisPointer) {
			var propClassName = Object.prototype.toString.call(thisPointer[i]);
			contract.push(prefix + i + " : " + propClassName);
			if(propClassName == "[object Object]") {
				recursiveContractExtract(prefix + "\t", thisPointer[i]);
			}
		}
	};
	recursiveContractExtract("", this);
	return contract.join("\n");
};

Classes = {};

module.exports = Classes;

Classes.registerClass = function(aNewClassName, aNewClass){
	// fool check
	if(Classes[aNewClassName]){
		if(process._debugMode){
			throw new Error("Class name '" + aNewClassName + "' is already taken.");
		}
	}
	Classes[aNewClassName] = aNewClass;
	return Classes;
};

Classes.StringCache = function(csvLangFName) {
	var CP = Classes.CallbackParam;
	var defer;
	this.jsonStore;
	this.objStore;
	this.supportedLangs = [];
	var self = this;
	function constructor(csvFName) {
		var defer = Q.defer();
		self.jsonStore = {};
		self.objStore = {};
		var ifFirstRow = true;
		csv.fromPath(csvFName, {
			objectMode : true,
			headers : true,
			delimiter : "\t"
			// delimiter : ";"
		}).on("data", function(data) {
			if(ifFirstRow) {
				ifFirstRow = false;
				for(var key in data) {
					if(key != "resname") {
						self.objStore[key] = {};
						self.supportedLangs.push(key);
					}
				}
			}
			var aName = data["resname"];
			for(var key in data) {
				if(key != "resname") {
					self.objStore[key][aName] = data[key];
				}
			}
			return;
		}).on("end", function() {
			self.jsonStore = {};
			Object.keys(self.objStore).forEach(function(aKey){
				self.jsonStore[aKey] = JSON.stringify(self.objStore[aKey]);
			});
			return defer.resolve();
		}).on("error", function(err){
			return defer.reject(err);
		});
		return defer;
	}
	defer = constructor(csvLangFName);

	this.getAsObj = function(lang, callback){
		this._get(true, lang, callback);
	};

	this._get = function(ifObj, lang, callback){
		if(process._debugMode){
			console.warn("Rereading!");
			defer = constructor(csvLangFName);
		}
		defer.promise.then(function resolve(){
			var _storeRef = ifObj?self.objStore:self.jsonStore;
			if((_storeRef[lang])){
				callback(new Classes.CallbackParam(200, _storeRef[lang], ""));
			}else{
				callback(new Classes.CallbackParam(400, _storeRef["en"], "The chosen language isn't supported. Switching to English. The lang: " + lang));
			}
		}, function reject(err){
			callback(new Classes.CallbackParam(500, null, err));
		});
	};

	this.getString = function(lang, strName, cb){
		defer.promise.then(function resolve(){
			var cp;
			if(self.objStore[lang] && self.objStore[lang][strName]){
				cp = new CP(200, self.objStore[lang][strName], "");
			}else{
				cp = new CP(400, null, "Either the language or strName aren't there");
			}
			return cb(cp);
		}, function reject(err){
			return cb(new CP(500, null, err));
		});
	};

	this.getLangList = function(cb){
		defer.promise.then(function resolve(){
			return cb(self.supportedLangs);
		}, function reject(err){
			return err;
		});
	};

	this.getLocale = function(lang, callback) {
		this._get(false, lang, callback);
	};
};

Classes.CallbackParam = function(code, data, message) {
	if(_.isError(code)){
		this.code = 500;
		this.data = null;
		this.message = code.message || code.toString();
		this.error = code;
	}else{
		this.code = code;
		this.data = data;
		this.message = message;
		this.error = new Error(message);
	}
	this.msg = this.message;
	this.isErr = function() {
		if(this.code < 200 || this.code >= 400) {
			return true;
		}
		return false;
	};
	this.isExcep = function() {
		if(this.code >= 500) {
			return true;
		}
		return false;
	};
	if(process._debugMode && this.isErr()){
		throw new Error(this.message);
	}
};

Classes.Gui = function(guiType, guiSubType, url, selectionPrinciple) {
	this.isValid = false;
	this.guiType = guiType;
	this.guiSubType = guiSubType;
	this.url = url;
	this.selectionPrinciple = selectionPrinciple;
	this.selectionPrincipleText = this.selectionPrinciple;
	this.guiTypeText = this.guiType;
	this.guiSubTypeText = guiSubType;
	this.baseUrl = undefined;
	// if(this.guiTypeText){
	// this.guiSubTypeText = locals.guiSubTypes[this.guiType][this.guiSubType];
	// }
	this.isValid = (this.guiSubTypeText && this.selectionPrinciple && this.url) ? true : false;
	if(!this.isValid) {
		console.error("#O8ILv The data provided to create a GUI object weren't correct: guiSubTypeText = %s; selectionPrinciple = %s; url = %s", this.guiSubTypeText, this.selectionPrinciple, this.url);
	}
	this.isValid &= _validateUrl(this.url);
	if(!this.isValid) {
		console.log("#sibFr The url provided to create a GUI object weren't correct: %s", this.url);
	} else {
		this.baseUrl = _getBaseUrl(this.url);
	}
};

Classes.Cache = function(pathesObj) {
	var cache = {};
	if(!process._debugMode) {
		for(var i in pathesObj) {
			cache[i] = fs.readFileSync(pathesObj[i], {
				encoding : "UTF-8"
			});
		}
	}
	this.getResource = function(resName) {
		if(process._debugMode) {
			return fs.readFileSync(pathesObj[resName], {
				encoding : "UTF-8"
			});
		}
		return cache[resName];
	};
};

Classes.GeoInfo = function(ip, country, region, city) {
	this.ip = ip;
	this.country = country;
	this.region = region;
	this.city = city;
};

Classes.Triplet = function(id, fname1, fname2, fname3, fname1min, fname2min, fname3min) {
	this.id = id;
	this.fnames = [fname1, fname2, fname3];
	this.fnamesMin = [fname1min, fname2min, fname3min];
};
