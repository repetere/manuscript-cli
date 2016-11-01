'use strict';
const fs = require('fs-extra');
const install_prefix = process.cwd();
const npm = require('npm');
const path = require('path');
let app_dir = path.join(process.cwd());
let custom_files_dir = path.join(__dirname, 'custom_files');
let manuscript_dir = path.join(process.cwd(), 'node_modules/manuscriptjs');
let manuscript_version;

let npm_load_options = {
  'strict-ssl': false,
  'save-optional': true,
  'no-optional': true,
  'production': true,
  'prefix': install_prefix
};

const install_manuscript = function () {
  console.log('Installing Manuscript'.green);
  return new Promise((resolve, reject) => {
    let manuscript = (manuscript_version) ? `manuscriptjs@${manuscript_version}` : `manuscriptjs`;
    npm.load(npm_load_options, err => {
      if (err) return reject('Error installing ManuscriptJS'.red.underline);
      npm.commands.install([manuscript], (err, data) => {
        if (err) return reject(`Error installing ManuscriptJS: ${err}`.red.underline);
        fs.copy(manuscript_dir, app_dir, function (err) {
          if (err) return reject(`Error copying ManuscriptJS files: ${err}`.red.underline);
          fs.remove(manuscript_dir, function (err) {
            if (err) return reject(`Error deleting ManuscriptJS from node_modules: ${err}`.red.underline);
            console.log('Successfully installed Manuscript'.green);
            return resolve();
          });
        });
      });
    });
  });
};

const copy_custom_files = function () {
  console.log('Copying custom files'.green);
  let scene_router_path = path.join(app_dir, 'node_modules/scene-router/lib');
  return new Promise((resolve, reject) => {
    fs.copy(custom_files_dir, scene_router_path, { clobber: true, dereference: true }, function (err) {
      if (err) return reject(err);
      console.log('Successfully copied custom files!'.green);
      return resolve();
    });
  });
};

const install_manuscript_deps = function () {
  console.log('Installing Manuscript Dependences'.green);
  return new Promise((resolve, reject) => {
    fs.readJson(path.join(app_dir, 'package.json'), (err, pkgobj) => {
      if (err) console.log(`Error installing Manuscript Deps ${err}`);
      npm_load_options.prefix = app_dir;
      npm.load(npm_load_options, err => {
        if (err) return reject(`Error loading NPM ${err}`);
        let deps = Object.keys(pkgobj.dependencies).concat(Object.keys(pkgobj.devDependencies));
        npm.commands.install(deps, (err, data) => {
          if (err) return reject(`Error installing Manuscript Dependencies ${err}`);
          console.log('Successfully installed Manuscript Dependencies'.green);
          return resolve();
        });
      });
    });
  });
};

const init = function (version) {
  let manuscript_version = version;
  install_manuscript()
    .then(install_manuscript_deps)
    .then(copy_custom_files)
    .catch(err => {
      console.log('Error: ', err.red.underline);
    });
};

module.exports = {
  start: init
};