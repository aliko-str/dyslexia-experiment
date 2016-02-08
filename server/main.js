const _rootF = "../";
const path = require('path');
const helpDir = path.resolve(__dirname, "helpers");
const classes = require(path.join(helpDir, "classes.js"));
const fs = require('fs');

var util = require(path.join(helpDir, "util.js"));
var notFoundLogger = require(path.join(helpDir, "not.found.logger.js"));
var stringCache = new classes.StringCache(path.resolve(__dirname, path.join("..", "data", "strings2new.csv")));
var async = require("async");
const dataLayer = require("./stimuli.management.js");
const settings = require("./settings.js");

function checkIfExpSessionFinished(sessionId, onDone) {
	dataLayer.resFilesPerSession(sessionId, function (paramObj) {
		if (paramObj.isErr()) {
			throw new Error(paramObj.message);
		}
		const ifFinished = paramObj.data >= settings.PSY_ASPECTS_NAMES.length;
		onDone(new classes.CallbackParam(200, ifFinished, ""));
	});
}

function saveTestRes(psyAsp, sessionId, stimulusIdRatingPairArr, onDone) {
	const fname = psyAsp + "_" + sessionId + ".txt";
	const ratingArr = stimulusIdRatingPairArr.map(function(el, i){
		return {fname: el.stimulusId, rating : el.rating};
	})
	dataLayer.saveRatingsOneSession(fname, ratingArr, onDone);
}

function selectImgForTest(onDone) {
	dataLayer.selectionStimuliOneSession(settings.NUM_STIMULI_PER_SESSION, function (paramObj) {
		if (!paramObj.isErr()) {
			paramObj.data = paramObj.data.map(function (aStimulus) {
				return {
					id: aStimulus.fname,
					codeName: aStimulus.fname
				};
			});
		}
		onDone(paramObj);
	});
}

module.exports = {
	checkIfExpSessionFinished: checkIfExpSessionFinished,
	saveTestRes: saveTestRes,
	selectImgForTest: selectImgForTest,
	stringCache: stringCache,
	generateSessionID: dataLayer.generateSessionID
};
