var jqRoot;
var settings = {
	redirectAfter : 20 * 1, // sec of inactivity
	maxFeedbackSymbols : 500
};

$(window).load(function(ev) {
	jqRoot = $("#root");
	afterRender(1);
});

function afterRender(i) {
	if(jqRoot.find("#msgContent").length) {
		var jqForm = jqRoot.find("#feedbackForm");
		_setUpRedirect();
		jqRoot.find("#proceed").off("click").on("click", function(ev){
			jqForm.submit();
		});
		jqForm.submit(function(ev) {
			ev.preventDefault();
			window.location.href = window._getNextUrl(window.App.params.nextPage);
			return;
			// TODO redo the hack + collect feedback?
			var feedbackStr = jqForm.find("#feedbackArea").val();
			if(feedbackStr) {
				window.enableDisableF(false);
				window._postToUrl(window.App.params.postUrl, function() {
					jqRoot.find("form").hide(300);
					jqRoot.find("#thanksForFeedback").show(300);
				}, function(jqXHR, textStatus, errorThrown) {
					// try to resubmit
					window.alert(window.App.S["resubmit"].interpolate({
						textStatus : textStatus
					}));
					window.enableDisableF(true);
				}, {
					feedback : feedbackStr
				});
			}
		});
		var jqCharactersLeft = jqRoot.find("#charactersLeft").text(settings.maxFeedbackSymbols);
		jqRoot.find("#feedbackArea").on("keypress", function(ev) {
			jqCharactersLeft.text(settings.maxFeedbackSymbols - $(this).val().length);
		});
	} else {
		console.log("Waiting a second for the dom to render: " + i);
		window.setTimeout(function() {
			afterRender(++i);
		}, 1000);
	}
	_attachCredit();
}
function _setUpRedirect() {
	var counter = 0;
	var jqCountDown = jqRoot.find("#nextSessionCountdown").text(_secToTime(settings.redirectAfter - counter));
	var jqFeed = jqRoot.find("#feedbackArea");
	var ifKeepCounting = true;
	window.setInterval(function() {
		if(ifKeepCounting) {
			if(counter >= settings.redirectAfter) {
				window.location.href = window._getNextUrl(window.App.params.nextPage);
			} else {
				counter++;
			}
			jqCountDown.text(_secToTime(settings.redirectAfter - counter));
		}
	}, 1000);
	jqFeed.on("click keydown keyup", function() {
		ifKeepCounting = false;
		window.setTimeout(function() {
			ifKeepCounting = true;
		}, 10000);
	});
}
function _secToTime(sec) {
	return Math.floor(sec / 60) + ":" + (sec % 60);
}
function _attachCredit(){
	const jqCredit = $('<div style="position:absolute;bottom:0;left:0;width:100%;"><small class="text-info pull-right">Icon design by Julien Deveaux fron the Noun Project.</small></div>');
	jqRoot.append(jqCredit);
}
