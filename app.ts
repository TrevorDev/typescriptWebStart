/// <reference path='typings/express/express.d.ts' />
/// <reference path='typings/body-parser/body-parser.d.ts' />
/// <reference path='typings/browserify/browserify.d.ts' />

import appFactory from "./libs/appFactory"
import browserify = require("browserify")
var app = appFactory.createApp()

app.get('/', function(req, res) {
	res.render('index')
});

app.get('/browserify/*', function(req, res) {
	var reqFile:string = req.params[0]
	reqFile = "./public/ts/"+reqFile//.replace(".js", ".ts")
	var b = browserify([reqFile])
	var stream = b.bundle()
	stream.on("data", function(buffer){
		res.write(buffer)
	})
	stream.on("end", function(){
		res.end()
	})
});

app.listen(3000, function(){
    console.log("Server running");
});