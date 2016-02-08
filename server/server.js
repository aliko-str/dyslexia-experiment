//!/bin/env node
var fs = require('fs');
var path = require('path');
var express = require("express");
var vhost = require('vhost');

process._debugMode = false;
process._productionMode = true;
process.env.TMPDIR = path.resolve(__dirname, './tmp/');
if(!fs.existsSync(process.env.TMPDIR)) {
	fs.mkdirSync(process.env.TMPDIR);
}
process.env._dataDir = process.env.OPENSHIFT_DATA_DIR;
process.env._adminResourceUrl = "/admin/persistent/";

var ip = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
var hostname = "atw-lab.com";
var nakedHostname = "atwlab-atwlab.rhcloud.com";

if(ip == undefined) {
	process.env._dataDir = process.env.TMPDIR + "/";
	process._productionMode = false;
	process._debugMode = true;
	port = process.env.OPENSHIFT_NODEJS_PORT || 8081;
	console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
	ip = "127.0.0.1";
	hostname = "atw-lab.loc";
	nakedHostname = hostname;
};
const dyslApp = require("./sub.server.js").init(port, ip, false).app;
//const server = express();
//
//server.use(vhost(nakedHostname, dyslApp));
//server.use(vhost("dyslexia." + hostname, dyslApp));

//server.listen(port, ip, function() {
//	console.log("Up and running on ip ", ip, ", port ", port, " and hostname ", hostname);
//});

dyslApp.listen(port, ip, function() {
	console.log("Up and running on ip ", ip, ", port ", port, " and hostname ", hostname);
});
