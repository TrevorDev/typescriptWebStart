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

var exec = cp.exec
gulp.task('default', function() {
  // runCommandLine("tsc", function(){
  //   browserifyViewLogic()
  // })
});

gulp.task("runAndWatch",function(){
  var nodemon = new CmdRunner("nodemon app.js -i *")
  nodemon.run()  
  watchAndCompile().forEach(function(data:any){
    console.log(data)
    if(isJSFile(data.file)){
      nodemon.sendToStdin("rs")
    }
  });
})

function watchAndCompile(){
  return rx.Observable.create(function (observer) {
    watchFolder('./')
      .filter((fileEvent)=>fileEvent.type == "save" || fileEvent.type == "change")
      .forEach(function(fileEvent){
        compileTSFile(fileEvent.file)
        .then(()=>browserifyFile(fileEvent.file))
        .then(()=>observer.onNext(fileEvent))
      })
    // watchFolder('./')
    // .flatMap(
    //   (fileEvent)=>compileTSFile(fileEvent.file),
    //   (fileEvent, compiled)=>fileEvent)
    // .flatMap(
    //   (fileEvent)=>browserifyFile(fileEvent.file),
    //   (fileEvent, compiled)=>fileEvent)
    // .forEach(function(data){
    //   observer.onNext(data)
    // })
    
    // watchFolder('./')
    //   .then(compileTS)
    //   .then(compileBrowserify)
    //   .then(function(){
    //     observer.onNext(data)
    //   })
    
    // watchFolder('./').forEach(function(data){
    //   compileTSFile(data.file)
    //   .then(function(){
    //     return browserifyFile(data.file)
    //   }).then(function(){
    //     observer.onNext(data)
    //   })
    // })
  })
}

function browserifyViewLogic() {
  glob("public/**/*.ts", function(err, f){
    // f.forEach(function(tsFile){
    //   compileTSFile(f, function() {
    //     browserifyFile(tsFile)
    //   })
    // })
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

function browserifyFile(tsFile) {
  return new Promise((resolve, reject) => {
    //change this to only do on file called logic.js in public folder????
    if(isInPublicFolder(tsFile)&&isTSFile(tsFile)){
      console.log("browserifying: "+tsFile+ " ...")
      var jsFile = path.dirname(tsFile)+"/logic.js"
      var outFile = path.dirname(tsFile)+"/bundle.js"
      new CmdRunner("browserify -d "+jsFile+" -o "+outFile).run().then(function(){
        resolve()
      })
    }else{
      resolve()
    }
  })
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
  var watcher = hound.watch(folder)
  var events = ["change", "create", "delete"].map(function(eventType){
    return rx.Observable.fromEvent(watcher, eventType).map(function(file:string, stats){
      return {file: file, stats: stats, type: eventType}
    })
  })
  return rx.Observable.merge(events)
}

class CmdRunner {
    private childProcess: cp.ChildProcess
    constructor(public cmd: string) { }
    run(){
        return new Promise((resolve, reject) => {
          this.childProcess = exec(this.cmd, function(){
            resolve()
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
      if(this.childProcess){
        if(process.platform === 'win32'){
          exec('taskkill /pid '+ this.childProcess.pid + ' /T /F');
        }else{
          exec('kill -s ' + "SIGKILL" + ' ' + this.childProcess.pid)
        }
        this.childProcess = null
      }
    }
};