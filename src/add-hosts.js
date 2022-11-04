#!/usr/bin/env node
const fs = require('fs');
const config = require('./config');
const PhishingDetector = require('./detector')

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

const detector = new PhishingDetector(config);

let allNew = true;
switch (list) {
  case 'blacklist':
    for (let i=0; i < hosts.length; i++) {
      const h = hosts[i];
      const r = detector.check(h);
      if (r.result) {
        console.error(`'${h}' already covered by '${r.match}' in '${r.type}'.`);
        allNew = false;
      }
    }
    break;
  case 'whitelist':
    for (let i=0; i < hosts.length; i++) {
      const h = hosts[i];
      const r = detector.check(h);
      if (!r.result) {
        console.error(`'${h}' does not require whitelisting`);
        allNew = false;
      }
    }
    break;
  case 'fuzzylist':
    const alreadyIncluded = hosts.filter(h => config.fuzzylist.includes(h));
    if (alreadyIncluded.length) {
      console.error(`'${alreadyIncluded.join(',')}' are already in fuzzylist`);
      allNew = false;
    }
  default:
    exitWithUsage(1);
}
// todo:  check if  no internal duplicates (generate new config>remove entry>check)

if (!allNew) {
  process.exit(1);
}

addHosts(list, hosts, './src/config.json');
