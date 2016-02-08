App = (App || {});

App.err = function(err, ifCritical){
	if(App.debug){
		console.error(err);
	}else if(ifCritical){
		window.alert("A critical error occured. Please try reloading the page. If the error persists, please email the webmaster at webmaster@e.atw-lab.com");
	}
	return App._postErr(err);
};

App._postErr = function(err) {
	$.ajax("/api/client.error/", {
		type : "POST",
		data : JSON.stringify({error: err, errorOriginPage: window.location.href}),
		dataType : "JSON",
		success : function(data, textStatus, jqXHR) {
			console.log("error noted.");
		},
		contentType : "application/json"
	});
	return;
};

window.App.Logger = {
	error : function(err, tryReload) {
		var errMsg = "At " + err.fileName + " , 	line number: " + err.lineNumber + " \n " + err.message;
		console.error(errMsg);
		$.ajax("/api/client.error/", {
			type : "POST",
			data : JSON.stringify({
				error : errMsg,
				errorOriginPage : window.location.href
			}),
			dataType : "JSON",
			success : function(data, textStatus, jqXHR) {
				console.log("Error noted fine.");
			},
			error : function(jqXHR, status, error) {
				console.log("Error noted not fine.");
			},
			contentType : "application/json"
		});
		if(tryReload){
			if(App.debug){
				throw err;
			}else{
				window.alert("A crucial error occured. Please try re-loading the page. If the error persists, please kindly contact the page administrator.");
			}
		}
	},
	log : function() {
		return console.log.apply(window, arguments);
	}
};

window.onerror = function(msg, url, line, col, error) {
	window.App.Logger.error(error || new Error(msg, line, url), true);
	var suppressErrorAlert = true;
	return suppressErrorAlert;
};

