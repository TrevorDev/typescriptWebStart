/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/gulp/gulp.d.ts' />
/// <reference path='typings/watch/watch.d.ts' />
/// <reference path='typings/glob/glob.d.ts' />
import gulp = require('gulp')
import watch = require('watch')
import cp = require('child_process')
import glob = require('glob')
import path = require('path')

var exec = cp.exec
gulp.task('default', function() {
  runCommandLine("tsc", function(){
    browserifyViewLogic()
  })
});

gulp.task("watchTS",function(){
  //WAYYYYY TOO SLOW AT WATCHING
  watchFolder('./', function(file){
    if(isTSFile(file)){
      compileTSFile(file, function(){
        if(file.match(/^public/)){
          browserifyFile(file)
        }
      })
    }
  })
})

gulp.task("runAndWatch",function(){
  runCommandLine("nodemon app.js")
  runCommandLine("gulp watchTS")
})


function browserifyViewLogic() {
  glob("public/**/*.ts", function(err, f){
    f.forEach(function(tsFile){
      compileTSFile(f, function() {
        browserifyFile(tsFile)
      })
    })
  })
}


function isTSFile(file) {
  return file.match(/[^.]*\.ts$/)
}

function browserifyFile(tsFile) {
  console.log("browserifying: "+tsFile+ " ...")
  var jsFile = path.dirname(tsFile)+"/logic.js"
  var outFile = path.dirname(tsFile)+"/bundle.js"
  runCommandLine("browserify -d "+jsFile+" -o "+outFile, function(err, out, stderr){
  })
}

function runCommandLine(cmd, cb?){
  var com = exec(cmd, cb)
  com.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });
  com.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
}

function compileTSFile(file, cb?) {
  console.log("Compiling ts: "+file)
  runCommandLine("tsc "+file+" --module commonjs", cb)
}

function watchFolder(folder:string, handler:Function) {
  watch.watchTree(folder, function (f, prev, curr) {
    if (typeof f == "object" && prev === null && curr === null) {
      // Finished walking the tree
    }else{
      console.log(f)
      handler(f)
    }
  })
}