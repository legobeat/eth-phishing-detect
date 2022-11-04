#!/usr/bin/env node
const fs = require('fs');
const config = require('./config');

const VALID_LIST_NAMES = [
  'blacklist', 'fuzzylist','whitelist'
];

function addHosts(list, domains, dest) {
  config[list] = config[list].concat(domains);

  const output = JSON.stringify(config, null, 2) + "\n";

  fs.writeFile(dest, output, (err) => {
    if (err) {
      return console.log(err);
    }
  });
}

const exitWithUsage = (exitCode) => {
  console.error(`Usage: ${
    process.argv.slice(0,2).join(' ')
  } ${
    VALID_LIST_NAMES.join('|')
  } hostname...`);
  process.exit(exitCode);
};

if (process.argv.length < 4) {
  exitWithUsage(1);
}

const list = process.argv[2];
const hosts = process.argv.slice(3);

if (!VALID_LIST_NAMES.includes(list) || hosts.length < 1) {
  exitWithUsage(1);
}

addHosts(list, hosts, './src/config.json');
