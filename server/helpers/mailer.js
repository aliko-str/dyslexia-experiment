var apiKey = "key-8vej1eqslgtq5nfmy37-v-pnyq4be6p5";
var apiBaseUrl = "https://api.mailgun.net/v3/e.atw-lab.com";
var mailGunDomain = "e.atw-lab.com";
var classes = require("./classes.js");
var juice = require('juice');
var mailgun = require('mailgun-js')({
	apiKey : apiKey,
	domain : mailGunDomain
});
var MailComposer = require("mailcomposer").MailComposer;

function notifyMeAboutAnError(err, fullFile) {
	var attch = new mailgun.Attachment({
		data : new Buffer(fullFile, "utf-8"),
		filename : "server.errors.log"
	});
	var data = {
		from : 'Me me me <miniukovich@e.atw-lab.com>',
		to : 'a.minyukovich@gmail.com',
		subject : 'Horray! Somebody used the site, though crased it.',
		text : err,
		attachment : attch
	};

	mailgun.messages().send(data, function(err, body) {
		if(err) {
			return console.error(err);
		}
		return console.log("Mailed the error messages to myself", body);
	});
}
function sendOutHtml(from, to, bcc, subject, plainText, nonInlinedHtml, onDone) {
	juice.juiceResources(nonInlinedHtml, {
		preserveImportant : true,
		preserveMediaQueries: true
	}, function cb(err, inlinedHTML) {
		var mailcomposer = new MailComposer({
			forceEmbeddedImages : true
		});
		mailcomposer.setMessageOption({
			from : from,
			to : to,
			body : plainText,
			html : inlinedHTML,
			subject : subject
		});
		(bcc) && mailcomposer.setMessageOption({
			bcc : bcc
		});
		mailcomposer.buildMessage(function(err, messageSource) {
			if(err) {
				onDone(new classes.CallbackParam(500, null, err));
				if(process._debugMode) {
					throw new Error(err);
				}
			}
			var dataToSend = {
				to : to,
				message : messageSource
			};

			mailgun.messages().sendMime(dataToSend, function(err, body) {
				if(err) {
					onDone(new classes.CallbackParam(500, null, err));
					if(process._debugMode) {
						throw new Error(err);
					}
				}
				return onDone(new classes.CallbackParam(200, "sent", ""));
			});
		});
	});
}

module.exports = {
	notifyMeAboutAnError : notifyMeAboutAnError,
	sendOutHtml : sendOutHtml
};
