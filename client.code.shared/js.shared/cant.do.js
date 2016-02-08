App = (App || {});
App.rootExtLibs = (App.rootExtLibs || "/externalstuff/");

function _alignGraphics(rootEl){
	var tmpH = (rootEl.find("#cantDoBottomDiv").height() + 10);
	var negHeightStr = "-" + tmpH + "px";
	var pHeightStr = rootEl.find("#cantDoTopDiv").height() + "px";
	rootEl.find("#cantDoBottomSpacer").css("height", pHeightStr);
	rootEl.find("#cantDoContainer").css("bottom", negHeightStr);
	rootEl.find("#cantDoExpand").click(function(ev){
		rootEl.find("#cantDoContainer").css("bottom", "0px");
		rootEl.find("#cantDoExpand").hide();
		rootEl.find("#cantDoCollapse").show();
	});
	rootEl.find("#cantDoCollapse").click(function(ev) {
		rootEl.find("#cantDoContainer").css("bottom", negHeightStr);
		rootEl.find("#cantDoExpand").show();
		rootEl.find("#cantDoCollapse").hide();
	});
}

function CantDo(elToAttach, appCode){
	if(!EJS){
		return console.error("There is no EJS module to fetch/render the cantDo module");
	}
	if(!window.loadCss){
		return console.error("There is not Util module loaded - can't fetch CSS.");
	}
	window.loadCss(App.rootExtLibs + "css/cant.do.css", function(){
		if(elToAttach.find("#cantDoIndicator")){
			if(elToAttach.find("#cantDoIndicator").css("height")){
				return true;
			}
		}
		return false;
	}, function(){
		_alignGraphics(elToAttach);
	});
	var cantDoEjs = new EJS({url: App.rootExtLibs + "ejs.shared/cant.do.ejs"});
	var cantDoStr = cantDoEjs.render();
	elToAttach.append(cantDoStr);
	var submitImmitator = function(ev){
		var dataToSend = {reason: elToAttach.find("#cantDoText").val(), appCode: appCode};
		if(dataToSend.reason){
			var buttonEl = $("#cantDoSubmit");
			var oldButtonText = buttonEl.val();
			buttonEl.val("Submitting..");
			$.ajax("/api/cantdo/", {
				type : "POST",
				data : JSON.stringify(dataToSend),
				dataType : "JSON",
				complete: function(jqXHR, textStatus){
					buttonEl.val(oldButtonText);
					elToAttach.find("#cantDoText").val("").attr("placeholder", "Sent. Thank you!. Do you want to tell us smth else?");
				},
				contentType : "application/json"
			});
		}
	};
	elToAttach.find("#cantDoSubmit").click(submitImmitator);
	elToAttach.find("#cantDoText").keypress(function(ev) {
		if(ev.which == 13){
			submitImmitator(ev);
		}
	});
};
