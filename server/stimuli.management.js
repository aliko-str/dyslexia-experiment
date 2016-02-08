// NOTE: we use this module as a data layer
const _rootF = "..";
const path = require("path");
const helpDir = path.resolve(__dirname, "helpers");
const tabTableReader = require(path.join(helpDir, "table.reader.js"));
const util = require(path.join(helpDir, "util.js"));
const _ = require("underscore");
const fs = require("fs");
const crypto = require("crypto");
const classes = require(path.join(helpDir, "classes.js"));

const stimuliFDB = path.resolve(__dirname, "registered.pages.txt");
const outDir = process.env._dataDir;
const inDir = path.join("..", "data", "img");

var stimuliDB = null;

function generateSessionID() {
	return crypto.randomBytes(16).toString('hex').slice(0, 16);
}

function _selectStimuliOneSession(numToSelect, onDone, colName) {
	if (!stimuliDB) {
		_initStimuliDB(function (stimuliAsArr) {
			stimuliDB = stimuliAsArr;
			return _selectStimuliOneSession(numToSelect, onDone);
		})
	} else {
		// 1 - sort the DB
		var dbCpy = _.sortBy(_.shuffle(stimuliDB), colName);
		var paramObj = null;
		// 2 - select stimuli least shown
		dbCpy = _.first(dbCpy, numToSelect);
		if (dbCpy && dbCpy.length) {
			paramObj = new classes.CallbackParam(200, dbCpy, "");
		} else {
			paramObj = new classes.CallbackParam(400, dbCpy, "Not enough stimuli");
		}
		return onDone(paramObj);
	}
}

function _saveRatingsOneSession(fname, ratingArr, onDone, colName) {
	if (!stimuliDB) {
		_initStimuliDB(function (stimuliAsArr) {
			stimuliDB = stimuliAsArr;
			return _saveRatingsOneSession(fname, ratingArr, onDone, colName);
		})
	} else {
		// 1 - write the ratingArr on disk
		_saveOneSessionOnDisk(fname, ratingArr, onDone);
		// 2 - update the stimuliDB in memory
		var _fnames = _.pluck(stimuliDB, 'fname');
		_.each(ratingArr, function (el, i) {
				var tmpInd = _.indexOf(_fnames, el.fname);
				stimuliDB[tmpInd][colName]++;
			})
		// 2.1 and on disk
		tabTableReader.writeArrInTabTable(stimuliFDB, stimuliDB);
	}
}

function _saveOneSessionOnDisk(fname, ratingArr, onDone) {
	var strToSave = _.map(ratingArr, function (el, i) {
		return el.fname + "\t" + el.rating;
	}).join("\n");
	strToSave = ("fname" + "\t" + "rating" + "\n") + strToSave;
	fs.writeFile(path.join(outDir, fname), strToSave, function (err) {
		var pObj = new classes.CallbackParam(200, null, "");
		if (err) {
			pObj = new classes.CallbackParam(500, null, err);
		}
		return onDone(pObj);
	});
}

function _createAStimulus(fname) {
	return {
		"fname": fname,
		"nevals": 0
	};
}

function _initStimuliDB(onDone) {
	// 0 - read what we have available from fs
	var stimuliAsObj = tabTableReader.readTabTableAsObj(stimuliFDB, "fname");
	var stimuliAsArr = tabTableReader.readTabTableAsArray(stimuliFDB) || [];
	// 1 - read all png files from FS
	fs.readdir(inDir, function (err, files) {
		files = files.filter(function (file) {
			return file.substr(-4) === '.png';
		});
		// 2 - update the stimuliDB
		files = files.filter(function (fname) {
			if (stimuliAsObj[fname]) {
				return false;
			}
			return true;
		});
		files.forEach(function (el, i) {
			stimuliAsArr.push(_createAStimulus(el));
		});
		// 3 - write the stimuliDB back on disk
		tabTableReader.writeArrInTabTable(stimuliFDB, stimuliAsArr);
		onDone(stimuliAsArr);
		return;
	})
	return;
};

function resFilesPerSession(sessionID, onDone) {
	fs.readdir(outDir, function (err, files) {
		if (err) {
			return onDone(new classes.CallbackParam(400, null, err));
		}
		files = files.filter(function (file) {
			return file.indexOf(sessionID.toString()) > -1;
		}) || [];
		return onDone(new classes.CallbackParam(200, files.length, ""));
	});
}

module.exports = {
	//	selectionStimuliOneSessionVC: _.partial(_selectStimuliOneSession, _, _, "nevals"),
	//	selectionStimuliOneSessionREAD: _.partial(_selectStimuliOneSession, _, _, "nevals"),
	//	saveRatingsOneSessionVC: _.partial(_saveRatingsOneSession, _, _, _, "nevals"),
	//	saveRatingsOneSessionREAD: _.partial(_saveRatingsOneSession, _, _, _, "nevals"),
	selectionStimuliOneSession: _.partial(_selectStimuliOneSession, _, _, "nevals"),
	saveRatingsOneSession: _.partial(_saveRatingsOneSession, _, _, _, "nevals"),
	generateSessionID: generateSessionID,
	resFilesPerSession: resFilesPerSession
};
