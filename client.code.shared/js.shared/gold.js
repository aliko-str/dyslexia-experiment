App.Gold = App.Gold || {};

App.Gold.settings = {
  maxGoldPerTest : 3,
  urlToSubmitGold: ""
};
App.Gold._timesPlayed = 0;
App.Gold._ejs = null;

App.Gold.tests = {
  "colors" : {
    _ejsUrl: "/externalstuff/ejs.shared/gold.color.ejs",
    numberOfQuestions: 1,
    _ejsDataTemplate : {
      cssColor : "",
      possibleColors : ["white", "green", "blue", "red", "black", "yellow", "pink", "orange"],
      _diceValue : 0
    },
    getData : function() {
      var diceValue = App.Gold._getRandomInt(0, (this._ejsDataTemplate.possibleColors.length - 1));
      var data = {
        cssColor : this._ejsDataTemplate.possibleColors[diceValue],
        possibleColors : this._ejsDataTemplate.possibleColors,
        _diceValue : diceValue
      };
      return data;
    },
    getValidationFunc : function(jqForm, data) {
      return function() {
        var selectedValue = jqForm.find("input[type='radio']:checked").val();
        if (data._diceValue == selectedValue) {
          return true;
        }
        return false;
      };
    }
  }
};
App.Gold._sendAnswer = function(dataToSave) {
  console.log(dataToSave);
  $.ajax(App.Gold.settings.urlToSubmitGold, {
    type : "POST",
    data : JSON.stringify(dataToSave),
    dataType : "JSON",
    error: function(jqXHR, status, errorThrown){
      console.log(jqXHR.responseText || errorThrown);
    },
    contentType: "application/json"
  });
};
App.Gold._getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

App.Gold.init = function(testType, urlToSubmitGold, maxGoldPerTest) {
  App.Gold.settings.maxGoldPerTest = maxGoldPerTest || App.Gold.settings.maxGoldPerTest;
  App.Gold.settings.urlToSubmitGold = urlToSubmitGold || App.Gold.settings.urlToSubmitGold;
  App.Gold._ejs = new EJS({url: App.Gold.tests[testType]._ejsUrl});
  App.Gold.playGold = function(jqCanvas, callback) {
    if (App.Gold.tests[testType]) {
      if (App.Gold._timesPlayed < App.Gold.settings.maxGoldPerTest) {
        App.Gold._timesPlayed++;
        var data = App.Gold.tests[testType].getData();
        var htmlStr = App.Gold._ejs.render({
          data : data
        });
        jqCanvas.html(htmlStr);
        var jqForm = jqCanvas.find("form");
        var validationFunc = App.Gold.tests[testType].getValidationFunc(jqForm, data);
        var dataToSubmit = {
          numOfAttempts : 0,
          numOfGolds: App.Gold.tests[testType].numberOfQuestions
        };
        jqForm.submit(function(ev) {
          dataToSubmit.numOfAttempts++;
          ev.preventDefault();
          if (validationFunc()) {
            App.Gold._sendAnswer(dataToSubmit);
            callback();
          }
          else {
            var messageToShow = "";
            if (dataToSubmit.numOfAttempts < 2) {
              messageToShow = "This answer is not entirely correct. We're sure it's just an accidental mistake. Please try again...";
            }
            else
            if (dataToSubmit.numOfAttempts < 3) {
              messageToShow = "Please pay more attention to the answers you give. This is important.";
            }
            else {
              messageToShow = "Really?! Are you sure you're neither colorblind, nor a robot?..";
            }
            window.alert(messageToShow);
          }
        });
        return true;
      }
    }
    else {
      console.error("#QOIzB There is no such 'Gold' test.");
    }
    return false;
  };

  App.Gold.rollDiceForGold = function(jqCanvas, chance, callback) {
    var rollDice = Math.random();
    if (rollDice < chance) {
      return App.Gold.playGold(jqCanvas, callback);
    }
    return false;
  };
};
