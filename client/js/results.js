var jqRoot;

var tmplResults = new EJS({
	url : '/public/views/results.ejs'
});

var tmplResSection = new EJS({
	url : '/public/views/result.section.ejs'
});

var tmplHeader = new EJS({
	url : '/public/views/visit.us.header.ejs'
});

var tmplFooter = new EJS({
	url : '/public/views/visit.us.footer.ejs'
});

var tmplResLegend = new EJS({
	url : "/public/views/result.section.legend.ejs"
});

const styles = {
	red : "#cc0000",
	redHover : "#e50000",
	yellow : "#FDB45C",
	yellowHover : "#FFC870",
	green : "#197319",
	greenHover : "#328332"
};

const pieChartOptions = {
		segmentShowStroke : true,
		segmentStrokeColor : "#fff",
		segmentStrokeWidth : 2,
		percentageInnerCutout : 0,
		animationSteps : 75,
		animationEasing : "linear",
		animateRotate : true,
		customTooltips : false,
		showTooltips: true,
		tooltipFillColor : "rgba(200,200,200,0.8)",
		tooltipFontFamily : "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		tooltipFontSize : 18,
		tooltipFontStyle : "normal",
		tooltipFontColor : "black",
		tooltipTitleFontFamily : "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		tooltipTitleFontSize : 18,
		tooltipTitleFontStyle : "normal",
		tooltipTitleFontColor : "black",
		tooltipYPadding : 5,
		tooltipXPadding : 5,
		tooltipCornerRadius : 6,
		tooltipXOffset : 10,
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>%"
	};

function _genId() {
	return "id" + Math.round(Math.random() * 10000) + "" + Math.round(Date.now() / 100000000);
}
function _buildArgList() {
	const argList = [];
	const r = window.App.params.testResults;
	const s = window.App.S;
	argList.push({
		compareToFull : s['whatOtherThought'].interpolate({
			noun : s["machine"]
		}),
		compareTo : s["machine"],
		corr : r.corr["compVC"],
		percentile : r.percent["compVC"],
		ifMachine : true,
		styles : styles
	});
	argList.push({
		compareToFull : s['whatOtherThought'].interpolate({
			noun : s["allOtherHumans"]
		}),
		compareTo : s["allOtherHumans"],
		corr : r.corr["otherHumans"],
		percentile : r.percent["otherHumans"],
		ifMachine : false,
		styles : styles
	});
	return argList;
}

$(document).ready(function() {
	jqRoot = $("#root");
	jqRoot.html(tmplResults.render({
		testResults : window.App.params.testResults
	}));

	const corrPieClass = "corr-pie-chart-container";
	const percentPieClass = "percent-pie-chart-container";
	const jqSections = jqRoot.find("#compareWrapper");
	_buildArgList().forEach(function(argObj) {
		var jqASection = $(tmplResSection.render(argObj));
		jqSections.append(jqASection);
		var id1 = _genId();
		var id2 = _genId();
		jqASection.find("." + corrPieClass).first().attr("id", id1);
		jqASection.find("." + percentPieClass).first().attr("id", id2);
		_.defer(renderPieCharts, id1, id2, argObj);
	});
	$("#loader").hide();
	_attachHandlers();
});

function renderPieCharts(id1, id2, argObj) {
	if(argObj.corr === undefined) {
		return;
	}
	var percent;
	const s = window.App.S;
	try {
		percent = parseFloat(argObj.percentile).toFixed(1);
	} catch (e) {
		App.err(e);
		percent = 50;
	}
	const sLow = s['resMeanLower'];
	const sHi = s['resMeanHigher'];
	const corr = (argObj.corr * 100).toFixed(1);
	const sPos = s['resCorrAgree'];
	const sNo = s['resCorrNotCompletely'];
	const sNeg = s['resCorrDisagree'];

	var dataPerc = [{
		value : percent,
		color : styles.green,
		highlight : styles.greenHover,
		label : sLow
	}, {
		value : (100 - percent).toFixed(1),
		color : styles.red,
		highlight : styles.redHover,
		label : sHi
	}];

	var dataCorr = [{
		value : corr > 0 ? corr : 1.0,
		color : styles.green,
		highlight : styles.greenHover,
		label : sPos
	}, {
		value : 99 - Math.abs(corr),
		color : styles.yellow,
		highlight : styles.yellowHover,
		label : sNo
	}, {
		value : corr <= 0 ? Math.abs(corr) : 1.0,
		color : styles.red,
		highlight : styles.redHover,
		label : sNeg
	}];

	const jqCanvasCorr = $("#" + id1);
	new Chart(jqCanvasCorr.get(0).getContext("2d")).Pie(dataCorr, pieChartOptions);
	jqCanvasCorr.parent().append(tmplResLegend.render({
		data : dataCorr
	}));
	const jqCanvasPerc = $("#" + id2);
	new Chart(jqCanvasPerc.get(0).getContext("2d")).Pie(dataPerc, pieChartOptions);
	jqCanvasPerc.parent().append(tmplResLegend.render({
		data : dataPerc
	}));
}
function _attachHandlers() {
	jqRoot.find("form").submit(function(ev) {
		ev.preventDefault();
		var emailAddr = $(this).find("#theEmail").val();
		var dataToSend = {};
		if(emailAddr) {
			if(!_validateEmail(emailAddr)) {
				return jqRoot.find("#emailError").slideDown(500);
			}
			window.enableDisableF(false);
			jqRoot.find("#emailError").hide();

			dataToSend = {
				email : emailAddr,
				fallback : _stripHTML(),
				html : _stringifyHtml()
			};
		}
		return window._postToUrl(window.App.params.postUrl, function(data, textStatus, jqXHR) {
			// fool check
			var nextPageUrl = data.nextPageUrl.substring(0);
			window.location.href = window._getNextUrl(nextPageUrl);
		}, function(jqXHR, textStatus, errorThrown) {
			// try to resubmit
			window.alert(window.App.S["resubmit"].interpolate({
				textStatus : textStatus
			}));
			window.enableDisableF(true);
		}, dataToSend);
	});
}
function _stringifyHtml() {
	jqRoot.prepend(tmplHeader.render());
	jqRoot.append(tmplFooter.render());
	_canvasToImg(jqRoot.find("canvas"));
	var jqHTML = $("html").clone();
	jqRoot.find("header, footer").hide();
	jqHTML.find("#emailForm").remove();
	jqHTML.find("script").remove();
	jqHTML.find("#resultTitleBox").remove();
	jqHTML.find("*[src]").each(function(i, el) {
		$(el).attr("src", el.src);
	});
	jqHTML.find("*[href]").each(function(i, el) {
		$(el).attr("href", el.href);
	});
	return jqHTML[0].outerHTML;
}
function _stripHTML() {
	var _clone = $("#root").clone();
	_clone.find("script").remove();
	var html = _clone[0].innerHTML;
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText;
}
function _validateEmail(email) {
	var re = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return re.test(email);
}
function _canvasToImg(jqCanv){
	jqCanv.each(function(i, el){
		el = $(el);
		var jqImg = $("<img/>");
		jqImg.width(el.width());
		jqImg.height(el.height());
		jqImg.attr("src", this.toDataURL());
		el.replaceWith(jqImg);
	});
}
