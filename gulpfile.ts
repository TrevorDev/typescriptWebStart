import gulp = require('gulp')
import cp = require('child_process')
import glob = require('glob')
import path = require('path')
import rx = require('rx')
import fs = require('fs')
import cr = require("cmd-runner")

var exec = cp.exec
var ignorePaths = ["./node_modules/**", "./typings/**", "./bower_components/**", "./custom_typings/**"]

//compiles all ts files
gulp.task('default', function() {
  console.log("use atom-typescript instead for autocompile without needing references")
  var tsFiles = glob.sync("./**/*.ts", {ignore:ignorePaths})
    tsFiles.forEach(function(tsFile){
      compileTSFile(tsFile);
    })
});

gulp.task("runAndWatch",function(){
  var nodemon = new cr.CmdRunner("node app.js")
  nodemon.run()
  watchAndCompile().forEach(function(data:any){
    if(isJSFile(data.file)){
      nodemon.kill().then(function(){
        nodemon.run()
      })
    }
  });
})

function watchAndCompile(){
  return rx.Observable.create(function (observer) {
    watchFolder('./')
      .filter((fileEvent)=>fileEvent.type == "save" || fileEvent.type == "change")
      .forEach(function(fileEvent){
        compileTSFile(fileEvent.file)
        .then(()=>observer.onNext(fileEvent))
      })
  })
}

function isTSFile(file) {
  return file.match(/[^.]*\.ts$/)
}

function isJSFile(file) {
  return file.match(/[^.]*\.js$/)
}

function isInPublicFolder(file) {
  return file.match(/^public/)
}

function compileTSFile(file) {
  return new Promise<boolean>((resolve, reject) => {
    if(isTSFile(file)){
      console.log("Compiling ts: "+file)
      new cr.CmdRunner("tsc "+file+" --module commonjs").run().then(function(){
        resolve(true);
      })
    }else{
      resolve(false);
    }
  })
}

function watchFolder(folder:string) {
  //TODO: watch new folders when created
  var watchTimeStamps = {};
  var repeatEventFilter = 300 // 300 milisecond

  var folders = glob.sync(folder+"**", {ignore:ignorePaths})
    .filter((f)=>fs.lstatSync(f).isDirectory())


  var folderEventStreams = folders.map(function(f){
    //may not work on osx but screw those guys jk
    var watcher = fs.watch(f)
    watcher.on("error", function(){

    })
    return rx.Observable.fromEvent(watcher, "change", (args)=>({file: args[1]?f+"/"+args[1]:null, type: args[0]}))
  })


  return rx.Observable.merge(folderEventStreams)
    .filter((fileEvent)=>fileEvent.file != null)
    .filter(function(fileEvent){
      //some os fire multiple events on change so ignore the same event if fired twice within a timespan
      var curTime = new Date().getTime()
      var key = fileEvent.type+fileEvent.file
      if(!watchTimeStamps[key] || (curTime - watchTimeStamps[key]) > repeatEventFilter){
        watchTimeStamps[key] = curTime;
        return true;
      }else{
        return false;
      }
    })
}
