import appFactory = require("./libs/appFactory")
import browserify = require("browserify")

let app = appFactory.createApp()

app.get('/',async function(req, res) {
	res.render('index')
});

app.get('/browserify/*', function(req, res) {
	//todo cache this in production
	let reqFile:string = req.params[0]
	let stream = browserify(["./public/ts/"+reqFile]).bundle()
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
