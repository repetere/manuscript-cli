'use strict';

/**
 * Manuscript - Pre install script
 * Sets up folder structure for Manuscript installation
 *
*/

const Promisie = require('promisie');
const fs = require('fs-extra');
const path = require('path');

const node_modules_dir = path.join(process.cwd(), 'node_modules');

const make_node_modules_dir = new Promise((resolve, reject) => {
  fs.stat(node_modules_dir, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});


const start = function () {
  make_node_modules_dir
    .then(null, () => {
      return new Promise((resolve, reject) => {
        fs.mkdir(node_modules_dir, (err, data) => {
          if (err) reject(err);
          console.log(`${node_modules_dir} successfully created`.green);
          resolve(data);
        })
      })
    })
    .then(() => {
      console.log('PRE INSTALL COMPLETED SUCCESSFULLY'.green);
    })
    .catch(err => {
      console.log(`Error running preinstall script: ${err}`);
    });
};


module.exports = { start };

