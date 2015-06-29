import appFactory from "./libs/appFactory"
import browserify = require("browserify")
var app = appFactory.createApp()

app.get('/', function(req, res) {
	res.render('index')
});



app.get('/browserify/*', function(req, res) {
	//todo cache this in production
	var reqFile:string = req.params[0]
	var stream = browserify(["./public/ts/"+reqFile]).bundle()
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
