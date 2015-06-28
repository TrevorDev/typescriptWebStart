/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/gulp/gulp.d.ts' />
/// <reference path='typings/watch/watch.d.ts' />
/// <reference path='customTypings/hound/hound.d.ts' />
/// <reference path='typings/glob/glob.d.ts' />
/// <reference path='typings/es6-promise/es6-promise.d.ts' />
/// <reference path='typings/rx/rx.all.d.ts' />
import gulp = require('gulp')
import watch = require('watch')
import hound = require('hound')
import cp = require('child_process')
import glob = require('glob')
import path = require('path')
import rx = require('rx')
import fs = require('fs')

var ignorePaths = ["./node_modules/**", "./typings/**", "./bower_components/**", "./custom_typings/**"]

var exec = cp.exec
gulp.task('default', function() {
  var tsFiles = glob.sync("./**/*.ts", {ignore:ignorePaths})
  //console.log(tsFiles)
    tsFiles.forEach(function(tsFile){
      compileTSFile(tsFile)
    })
});

gulp.task("runAndWatch",function(){
  var nodemon = new CmdRunner("node app.js")
  nodemon.run()  
  watchAndCompile().forEach(function(data:any){
    //console.log(data)
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
        //console.log(fileEvent)
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
      new CmdRunner("tsc "+file+" --module commonjs").run().then(function(){
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
      //console.log(fileEvent)
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



class CmdRunner {
    private childProcess: cp.ChildProcess
    constructor(public cmd: string) { }
    run(){
        return new Promise((resolve, reject) => {
          if(this.childProcess){
            //already started
            resolve(false)
            return
          }
          this.childProcess = exec(this.cmd, function(){
            resolve(true)
          })
          this.childProcess.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
          });
          this.childProcess.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
          });
        })
    }
    sendToStdin(text:string){
      if(this.childProcess){
        this.childProcess.stdin.write(text)
      }
    }
    
    kill(){
      return new Promise((resolve, reject) => {
        if(this.childProcess){
          if(process.platform === 'win32'){
            exec('taskkill /pid '+ this.childProcess.pid + ' /T /F', function(){
              resolve(true)
            })
          }else{
            //not tested on linux or osx yet
            exec('kill -s ' + "SIGKILL" + ' ' + this.childProcess.pid, function(){
              resolve(true)
            })
          }
          this.childProcess = null
        }else{
          resolve(false)
        }
      })
    }
};