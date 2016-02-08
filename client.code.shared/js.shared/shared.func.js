var App = App || {};

App.Func = App.Func || {};

App.Func.settings = {
  briefQuestionDelay: 4, //sec
  longQuestionDelay: 6 //sec
};

App.Func.disableSubmitForNQuest = function(jqSubmit, numOfBriefQuestions, numOfLongQuestions, clickCallback){
  var delaySec =  1 + App.Func.settings.briefQuestionDelay * numOfBriefQuestions + App.Func.settings.longQuestionDelay * numOfLongQuestions;
  return App.Func.disableSubmitForNSec(jqSubmit, delaySec, clickCallback);
};

App.Func.disableSubmitForNSec = function(jqSubmit, sec, clickCallback){
  var delaySec = sec || 5;
  var strVal = "Unfreezes in ";
  var oldStrVal = jqSubmit.val();
  jqSubmit.attr("title", "You can't submit answers before the button unfreezes. This is a part of our anti-bot policy.");
  jqSubmit.attr("style", "box-shadow: none;cursor: not-allowed;opacity: 0.5;");
  jqSubmit.tooltip();
  jqSubmit.hover(function(ev){
    ev.preventDefault();
  }, function(ev){
    ev.preventDefault();
  });
  jqSubmit.click(function(ev){
    ev.preventDefault();
  });
  function tick(secondLeft){
    if(secondLeft){
      jqSubmit.val(strVal + secondLeft.toString());
      window.setTimeout(function(){
        tick(secondLeft - 1);
      }, 1000);
    }else{
      jqSubmit.val(oldStrVal);
      jqSubmit.removeAttr("style");
      jqSubmit.off("click");
      jqSubmit.off("hover");
      if(clickCallback){
        jqSubmit.click(clickCallback);
      }
      jqSubmit.removeAttr("title");
      jqSubmit.removeAttr("data-original-title");
      jqSubmit.tooltip({disabled: true});
    }
  };
  tick(delaySec);
};
