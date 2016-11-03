#! /usr/bin/env Node
'use strict';
/**
 * Require dependencies
 */
const colors = require('colors');
const fs = require('fs-extra');
const install_prefix = process.cwd();
const npm = require('npm');
const path = require('path');
const pre_install = require('./scripts/pre_install');
const install = require('./scripts/install');
const program = require('commander');
const app_dir = path.join(process.cwd());
let spawn = require('child_process').spawn;
let child;

let runtimeENV = 'dev';

const run_cmd = function (cmd, args, callback, env) {
  var spawn = require('child_process').spawn;

  if (env) {
    child = spawn(cmd, args, env);		
  }
  else {
    child = spawn(cmd, args);		
  }

  child.stdout.on('error', function (err) {
    console.error(err);
    process.exit(0);
  });

  child.stdout.on('data', function (buffer) {
    console.log(buffer.toString());
  });

  child.stderr.on('data', function (buffer) {
    console.error(buffer.toString());
  });

  child.on('exit', function () {
    callback(null, 'command run: ' + cmd + ' ' + args);
    process.exit(0);
  }); 
};

const check_webpack_config = new Promise((resolve, reject) => {
  let expected_webpack_config = path.join(app_dir, 'web/webpack.config.js');
  fs.stat(expected_webpack_config, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(expected_webpack_config);
    }
  });
});

program
  .version(require('./package').version)
  .option('-a, --all', 'all environments');

program
  .command('pre-install')
  .alias('preinstall')
  .action(() => {
    console.log('Running Pre-install script'.green.underline);
    pre_install.start();
  });

program
  .command('post-install')
  .alias('postinstall')
  .action(() => {
    console.log('Running Post-install script'.green.underline);
    // post_install.init();
  });

program
  .command('set [env]')
  .alias('s')
  .action(env => {
    if(!env) return console.log('Please specify environment'.red.underline);
    console.log(`Setting enviornment ${env}`.green.underline);
  });

program
  .command('build [env]')
  .alias('b')
  .action(env => {
    if (!env) env = runtimeENV;
    check_webpack_config
      .then((webpack_config) => {
        console.log('Webpack Config: ', webpack_config);
        run_cmd('webpack', ['--config', webpack_config], function (err, text) { console.log(text) });
      }, (err) => {
        console.log(`Error running build ${err}`);
      });
  });

program
  .command('install [version]')
  .alias('i')
  .action(version => {
    pre_install.start()
      .then(() => {
        return install.start(version)
      })
      .catch(err => {
        console.log('Error in the manuscript install process');
      });
  });

program
  .command('custom')
  .description('Copies custom files to node_modules')
  .action(() => {
    install.custom();
  });

program.parse(process.argv); 