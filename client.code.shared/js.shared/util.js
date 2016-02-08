String.prototype.interpolate = function(o) {
	return this.replace(/{([^{}]*)}/g, function(a, b) {
		var r = o[b];
		return typeof r === 'string' || typeof r === 'number' ? r : a;
	});
};

String.getNumberEndings = function(num) {
	if( typeof num !== 'number') {
		return "";
	}
	var ending;
	switch (num) {
		case 1:
			ending = "st";
			break;
		case 2:
			ending = "nd";
			break;
		case 3:
			ending = "rd";
			break;
		default:
			ending = "th";
			break;
	}
	return ending;
};

Array.prototype.copy = function() {
	return this.slice(0);
};

Array.prototype.shuffle = function() {
	var array = this;
	var currentIndex = array.length, temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while(0 !== currentIndex) {
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

Array.objToArray = function(obj) {
	var arr = [];
	for(var i in obj ) {
		if(obj.hasOwnProperty(i)) {
			arr.push(i);
		}
	}
	return arr;
};

if('function' !== typeof Array.prototype.reduce) {
	Array.prototype.reduce = function(callback, opt_initialValue) {'use strict';
		if(null === this || 'undefined' === typeof this) {
			// At the moment all modern browsers, that support strict mode, have
			// native implementation of Array.prototype.reduce. For instance, IE8
			// does not support strict mode, so this check is actually useless.
			throw new TypeError('Array.prototype.reduce called on null or undefined');
		}
		if('function' !== typeof callback) {
			throw new TypeError(callback + ' is not a function');
		}
		var index, value, length = this.length >>> 0, isValueSet = false;
		if(1 < arguments.length) {
			value = opt_initialValue;
			isValueSet = true;
		}
		for( index = 0; length > index; ++index) {
			if(this.hasOwnProperty(index)) {
				if(isValueSet) {
					value = callback(value, this[index], index, this);
				} else {
					value = this[index];
					isValueSet = true;
				}
			}
		}
		if(!isValueSet) {
			throw new TypeError('Reduce of empty array with no initial value');
		}
		return value;
	};
}

if(!Object.keys) {
	Object.keys = function(obj) {
		var keys = [], k;
		for(k in obj) {
			if(Object.prototype.hasOwnProperty.call(obj, k)) {
				keys.push(k);
			}
		}
		return keys;
	};
}

Array.prototype.sumup = function() {
	var result = this.reduce(function(a, b) {
		return a + b;
	});
	return result;
};

var regexps = {};

regexps.emailShort = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
regexps.email = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
regexps.url = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;
RegExp.prototype.email = function(emailStr) {
	return regexps.email.exec(emailStr);
};
RegExp.prototype.url = function(urlStr) {
	return regexps.url.exec(urlStr);
};

window.parseUrl = function(url) {
	var a = document.createElement('a');
	a.href = url;
	return {
		source : url,
		protocol : a.protocol.replace(':', ''),
		host : a.hostname,
		port : a.port,
		query : a.search,
		params : (function() {
			var ret = {}, seg = a.search.replace(/^\?/, '').split('&'), len = seg.length, i = 0, s;
			for(; i < len; i++) {
				if(!seg[i]) {
					continue;
				}
				s = seg[i].split('=');
				ret[s[0]] = s[1];
			}
			return ret;
		})(),
		file : (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
		hash : a.hash.replace('#', ''),
		path : a.pathname.replace(/^([^\/])/, '/$1'),
		relative : (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
		segments : a.pathname.replace(/^\//, '').split('/')
	};
};

window.loadCss = function(href, onLoadCondition, onLoadCallback) {
	var fileref = document.createElement("link");
	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");
	fileref.setAttribute("href", href);
	if( typeof fileref != "undefined") {
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}
	if(onLoadCondition && onLoadCallback){
		var tmpOnLoadWrapper = function(){
			if(onLoadCondition()){
				onLoadCallback();
			}else{
				setTimeout(tmpOnLoadWrapper, 200);
			}
		};
		tmpOnLoadWrapper();
	}
};

window.loadJsFile = function(jsurl, onloadCallback) {
	var fileref = document.createElement('script');
	fileref.setAttribute("type", "text/javascript");
	fileref.setAttribute("src", jsurl);
	fileref.onreadystatechange = function() {
		if(this.readyState == 'complete')
			onloadCallback();
	};
	fileref.onload = onloadCallback;
	document.getElementsByTagName("head")[0].appendChild(fileref);
};
