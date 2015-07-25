import appFactory = require("./libs/appFactory")
import browserify = require("browserify")
import Sequelize = require('sequelize');
let db = new Sequelize("postgres", "postgres", "", {
	host: 'trevorb.cloudapp.net',
  dialect: 'postgres'
});
let User = db.define('user', {
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name' // Will result in an attribute that is firstName when user facing but first_name in the database
  },
  lastName: {
    type: Sequelize.STRING
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});
db.sync({force: true})

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
