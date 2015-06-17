/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/gulp/gulp.d.ts' />
/// <reference path='typings/watch/watch.d.ts' />
/// <reference path='typings/glob/glob.d.ts' />
import gulp = require('gulp')
import watch = require('watch')
import cp = require('child_process')
import glob = require('glob')

var exec = cp.exec
gulp.task('default', function() {
  exec("tsc", function(err, out, stderr){
    console.log(out, stderr)
	  exec("browserify -d public/ts/index.js -o public/ts/bundle.js", function(err, out, stderr){
		  console.log(out, stderr)
		  console.log("\nBuild Complete")
	  })
  })
});

gulp.task("watchTS",function(){
  // glob("views/**", function(err, f){
  //   console.log(f)
  // })
  watchFolder('./', function(file){
    if(isTSFile(file)){
      compileTSFile(file)
    }
  })
})

gulp.task("runAndWatch",function(){
  
  runCommandLine("nodemon app.js")
  runCommandLine("gulp watchTS")
})

function isTSFile(file) {
  return file.match(/[^.]*\.ts$/)
}


function runCommandLine(cmd){
  var com = exec(cmd)
  com.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });
  
  com.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
}

function compileTSFile(file) {
  console.log("Compiling ts: "+file)
  exec("tsc "+file)
}

function watchFolder(folder:string, handler:Function) {
  watch.createMonitor(folder, function (monitor) {
    monitor.on("created", function (f, stat) {
      handler(f)
    })
    monitor.on("changed", function (f, curr, prev) {
      handler(f)
    })
    monitor.on("removed", function (f, stat) {
      handler(f)
    })
  })
}