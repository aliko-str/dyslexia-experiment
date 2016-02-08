var Classes = {};

Classes.Module = function(baseUrl, companyName, website, screenIm, logoIm, homeIm, imType){
  this.logoIm, this.homeIm, this.allIm, this.screenIm, this.companyName = companyName, this.website = website;
  var siteFolder = baseUrl + "/" + website + "/";
  this.logoIm = new Classes.ResIm(siteFolder + logoIm + "." + imType, logoIm, website);
  this.screenIm = [];
  var iscrMax = screenIm.length;
  for (var iscr = 0; iscr < iscrMax; iscr++){
    resIm = new Classes.ResIm(siteFolder + screenIm[iscr] + "." + imType, screenIm[iscr], website);
    if(screenIm[iscr] == homeIm){
      this.homeIm = resIm;
    }
    this.screenIm.push(resIm);
  }
  if(!this.homeIm){
    console.error("Homepage wasn't specified while creating module for: '" + website);
  }
  this.allIm = this.screenIm.copy();
  this.allIm.push(this.logoIm);
};

Classes.Module.allLoaded = false;

Classes.ResIm = function(url, type, website){
  this.url = url;
  this.type = type;
  this.jqObj = null;
  this.id = website + "_" + type;
};

Classes.ResStep = function(title, instructions){
  this.title = title;
  this.instructions = instructions;
};

Classes.ResConstruct = function(name, help, questions){
  this.name = name;
  this.help = help;
  this.questions = questions;
  for (var i = 0; i < this.questions.length;i++){
    this.questions[i].construct = this;
  }
  this.correctQuestions = function(objToInterpolate){
    for (var i = 0; i < this.questions.length; i++){
      this.questions[i].question = this.questions[i]._questionInitialCopy.interpolate(objToInterpolate);
    }
  };
};

Classes.ResQuestion = function(uniqueName, question, scaleSize, minAdj, maxAdj){
  this.uniqueName = uniqueName;
  this.construct = null;
  this.question = question;
  this._questionInitialCopy = question;
  this.scale = {};
  this.scale.size = scaleSize;
  this.scale.minAdj = minAdj;
  this.scale.maxAdj = maxAdj;
};


Classes.BrandAttitude = function(){
  var _dataStorage = {};
  this.addBrand = function(website, data){
    _dataStorage[website] = {};
    _dataStorage[website]["brand.familiarity"] = data["brand.familiarity"];
    _dataStorage[website]["value.for.money"] = data["value.for.money"];
    _dataStorage[website]["respect"] = data["respect"];
    _dataStorage[website]["have.things"] = data["have.things"];
  };
  this.getDataToSave = function(){
    return _dataStorage;
  };
};

Classes.WebsiteAttitude = function(website, ratedQuality){
  var _dataStorate = {
    "website": website,
    "ratedQuality": ratedQuality,
    "trust": {},
    "loyalty": {}
    };
  this.addLiking = function(webpageId, liking){
    _dataStorate[webpageId] = liking;
  };
  this.addAttitude = function(websiteAttitude){
    _dataStorate.trust["trust1"] = websiteAttitude["trust"]["trust1"];
    _dataStorate.trust["trust2"] = websiteAttitude["trust"]["trust2"];
    _dataStorate.trust["trust3"] = websiteAttitude["trust"]["trust3"];

    _dataStorate.loyalty["loyalty1"] = websiteAttitude["loyalty"]["loyalty1"];
    _dataStorate.loyalty["loyalty2"] = websiteAttitude["loyalty"]["loyalty2"];
    _dataStorate.loyalty["loyalty3"] = websiteAttitude["loyalty"]["loyalty3"];
    _dataStorate.loyalty["loyalty4"] = websiteAttitude["loyalty"]["loyalty4"];
  };
  this.getDataToSave = function(){
    return _dataStorate;
  };
};
