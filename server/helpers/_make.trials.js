var fs = require("fs");
var path = require('path');

function createNTrials(pathToTrialIdsJs, numOfTrials, callback){
  var trialHandler = require(pathToTrialIdsJs);
  var folderToSaveTrials = path.dirname(pathToTrialIdsJs) + '/_trials/';
  if(!fs.existsSync(folderToSaveTrials)){
    fs.mkdirSync(folderToSaveTrials);
  }
  var currMoment = new Date().toISOString();
  var fileToSaveTrials = folderToSaveTrials + currMoment + '.txt';
  trialHandler.generateTrials(numOfTrials, function(paramObj){
    if(paramObj.code === 200){
      console.log("Behold! Here are the trial details: %j", paramObj.data);
      var dataStr = "trialId\tcode\n";
      paramObj.data.forEach(function(val, ind, arr){
        dataStr += val.trialId.toString() + "\t" +  val.code.toString()  +"\n";
      });
      fs.writeFile(fileToSaveTrials, dataStr, "utf8", function(err, fd){
        if(err){
          console.error("Couldn't open the file: %s, because of the error: %j", fileToSaveTrials, err);
        }else{
          console.log("Saved to file: %s", fileToSaveTrials);
        }
      });
      paramObj.data = dataStr;
    }
    callback(paramObj);
  });
}


module.exports = {
  createNTrials: createNTrials
};
