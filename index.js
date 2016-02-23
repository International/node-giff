#!/usr/bin/env node

'use strict';

let path    = require('path'),
    fs      = require('fs'),
    util    = require('util'),
    spawn   = require('child_process').spawn,
    exec    = require('child_process').exec,
    program = require('commander');

// set program info
program
  .version('0.0.5')
  .usage('[options] [<commit>] [--] [<path>...]')
  .option('--cached', 'show diff of staging files')
  .parse(process.argv);

// judge options
let options=[];
if (program.cached) {
  options.push('--cached');
}

// init output file
let realPath = path.dirname(fs.realpathSync(__filename));
outputJs(realPath, '');

let nspawn = function() {
  let args = ['diff'].concat(program.args).concat(options);
  console.log("spawning:" + args)
  return spawn('git', args);
}
// git diff
var giff = nspawn();
giff.stdout.on('data', function (data) {
  // git diff result encode to base64
  let base64Diff = data.toString('Base64');
  outputJs(realPath, base64Diff);
});

giff.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

giff.on('exit', function (code) {
});

function open_in_browser() {
  let binary = `which open && open `
  if(/linux/.test(process.platform)) {
    binary = "sensible-browser"
  }
  let command = `${binary} ${realPath}/index.html`;
  exec(command);
}

console.log(`${realPath}/index.html`);
open_in_browser()

function outputJs(dirPath, data) {
  let outputJsText = 'var lineDiffExample=window.atob("' + data + '");';
  fs.writeFileSync(`${dirPath}/dest/diff.js`, outputJsText);
}
