/// <reference path='typings/express/express.d.ts' />
/// <reference path='typings/body-parser/body-parser.d.ts' />

import appFactory from "./libs/appFactory"

var app = appFactory.createApp()

app.get('/', function(req, res) {
	res.render('index');    
});

app.listen(3000, function(){
    console.log("Server running");
});