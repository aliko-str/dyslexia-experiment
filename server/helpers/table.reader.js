// Small files only!
var fs = require("fs");

function _arrToObj(arr, mainCol) {
	var res = {};
	arr.forEach(function(el) {
		if(res[el[mainCol]]) {
			throw new Error("The mainCol values shall be unique");
		}
		res[el[mainCol]] = el;
	});
	return res;
}
function asVector(arr, col) {
	var res = [];
	for(var i = 0, ilen = arr.length; i < ilen; i++) {
		res[i] = arr[i][col];
	}
	return res;
}
function asMatrix(arr, colList) {
	var res = [];
	var klen = colList.length;
	for(var i = 0, ilen = arr.length; i < ilen; i++) {
		var row = [];
		for(var k = 0; k < klen; k++) {
			row[k] = arr[i][colList[k]];
		}
		res[i] = row;
	}
	return res;
}
function meanNonUniqueCol(arr, nameCol, scoreCol) {
	if(!arr.length) {
		return arr;
		// throw new Error("I really doubt the arr you wanted to aggregate should've been
		// empty.");
	}
	if(arr[0][nameCol] == undefined || arr[0][scoreCol] == undefined) {
		throw new Error("Columns not found");
	}
	var resObj = {};
	var tmpAccum = {};
	arr.forEach(function(el) {
		tmpAccum[el[nameCol]] = tmpAccum[el[nameCol]] || {
			sum : 0,
			num : 0
		};
		tmpAccum[el[nameCol]].sum += el[scoreCol];
		tmpAccum[el[nameCol]].num++;
	});
	for(var key in tmpAccum) {
		resObj[key] = {};
		resObj[key][nameCol] = key;
		resObj[key][scoreCol] = tmpAccum[key].sum / tmpAccum[key].num;
	}
	return resObj;
}
function fullJoinByColName(arr1, arr2, col1, col2) {
	col2 = col2 || col1;
	var arr2Obj;
	if(Object.prototype.toString.call(arr2) == "[object Array]") {
		arr2Obj = _arrToObj(arr2, col2);
	} else {
		arr2Obj = arr2;
	}
	if(!arr1.length || !Object.keys(arr2Obj).length) {
		throw new Error("Arrays are empty: len1 " + arr1.length + " len2: " + Object.keys(arr2Obj).length);
	}
	var _arr2Obj = arr2Obj[Object.keys(arr2Obj)[0]];
	var app1 = ".1";
	var app2 = ".2";
	if(arr1[0][col1] == undefined || _arr2Obj[col2] == undefined) {
		throw new Error("One of tables doesn't contain a necessary column: arr1 col '" + col1 + "' = " + arr1[0][col1] + "; arr2 col '" + col2 + "' = " + _arr2Obj[col2]);
	}
	var arr2keys = Object.keys(_arr2Obj);
	var arr1keys = Object.keys(arr1[0]);
	arr1.forEach(function(el1, i) {
		var t2Obj = arr2Obj[el1[col1]];
		arr2Obj[el1[col1]].__taken = true;
		// delete arr2Obj[el1[col1]];
		arr2keys.forEach(function(k) {
			if(k === col2) {
				// we don't copy the mergeBy columns
				return;
			}
			var k2 = k;
			if(arr1[i][k]) {
				arr1[i][k + app1] = arr1[i][k];
				delete arr1[i][k];
				k2 = k + app2;
			}
			if(t2Obj == undefined) {
				arr1[i][k2] = undefined;
			} else {
				arr1[i][k2] = t2Obj[k];
			}
		});
	});
	Object.keys(arr2Obj).filter(function(key) {
		return !arr2Obj[key].__taken;
	}).forEach(function(k) {
		var t2Obj = arr2Obj[k];
		delete t2Obj[col2];
		arr1keys.forEach(function(a1k) {
			if(t2Obj[a1k]) {
				t2Obj[a1k + app2] = t2Obj[a1k];
				t2Obj[a1k + app1] = undefined;
				delete t2Obj[a1k];
			} else {
				t2Obj[a1k] = undefined;
			}
		});
		arr1.push(t2Obj);
	});
	return arr1;
}
function readTabTableAsArray(fName) {
	var rows = fs.readFileSync(fName, {
		encoding : "utf-8"
	});
	var result = [];
	rows = rows.split("\n");
	if(rows.length) {
		var headers = rows[0].split("\t");
		for(var i = 1, ilen = rows.length; i < ilen; i++) {
			if(!rows[i]) {
				continue;
			}
			var items = rows[i].split("\t");
			var anObj = {};
			for(var k in headers) {
				// var aTryNum = parseFloat(items[k]);
				var aTryNum = Number(items[k]);
				if(isNaN(aTryNum)) {
					anObj[headers[k]] = items[k];
				} else {
					anObj[headers[k]] = aTryNum;
				}
			}
			result.push(anObj);
		}
	}
	return result;
}
function readTabTableAsObj(fName, mainColumn) {
	var aTableArr = readTabTableAsArray(fName);
	var result = {};
	if(aTableArr.length) {
		if(aTableArr[0][mainColumn] === undefined) {
			// let it fall
			throw new Error("The column '" + mainColumn + "' doesn't exist in the file " + fName);
		}
		for(var i = 0, ilen = aTableArr.length; i < ilen; i++) {
			var anObj = aTableArr[i];
			result[anObj[mainColumn]] = anObj;
		}
	}
	return result;
}
function writeArrInTabTable(fName, arr) {
	if(arr == undefined || arr.length == undefined) {
		throw new Error("The input to writeArrInTabTable should be an array");
	}
	var wStream = fs.createWriteStream(fName);
	wStream.on("error", function(err) {
		throw new Error(err);
	});
	var objKeys;
	arr.forEach(function(el, i) {
		if(!objKeys) {
			objKeys = Object.keys(el);
			var header = objKeys.join("\t").concat("\n");
			wStream.write(header);
		}
		var aRow = "";
		var ilen = objKeys.length;
		for(var i = 0; i < ilen; i++) {
			aRow = aRow + el[objKeys[i]] + (i === (ilen - 1) ? "\n" : "\t");
		}
		wStream.write(aRow);
	});
	wStream.end();
	return wStream;
}
function sortTableArrByColumn(tabTableAsArray, colName) {
	if( tabTableAsArray instanceof Array) {
		if(tabTableAsArray.length && tabTableAsArray[0][colName] === undefined) {
			throw new Error("No such column in the inp array: " + colName);
		}
		return tabTableAsArray.sort(function(a, b) {
			if(a[colName] < b[colName]) {
				return -1;
			} else if(a[colName] == b[colName]) {
				return 0;
			}
			return 1;
		});
	}
	throw new Error("The input arg must be an array");
}
function selectColumns(tabTableObjOrArr, colList) {
	Object.keys(tabTableObjOrArr).forEach(function(aKey) {
		var newRow = {};
		colList.forEach(function(colName) {
			newRow[colName] = tabTableObjOrArr[aKey][colName];
		});
		tabTableObjOrArr[aKey] = newRow;
	});
	return tabTableObjOrArr;
}

module.exports = {
	readTabTableAsArray : readTabTableAsArray,
	readTabTableAsObj : readTabTableAsObj,
	writeArrInTabTable : writeArrInTabTable,
	sortTableArrByColumn : sortTableArrByColumn,
	selectColumns : selectColumns,
	meanNonUniqueCol : meanNonUniqueCol,
	fullJoinByColName : fullJoinByColName,
	asVector : asVector,
	asMatrix : asMatrix
};
