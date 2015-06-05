/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/gulp/gulp.d.ts' />

import gulp = require('gulp')
import cp = require('child_process')

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