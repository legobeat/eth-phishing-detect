#!/usr/bin/env node
const PhishingDetector = require('./detector')
const config = require('./config.json')

const removeHostFromConfig = (section, host) =>  ({
  ...config,
  [section]: config[section].filter(h => h !== host),
});

const args = {
  jsonOut: process.argv[2] === '-j'
};

try {
  for (const host of config.blacklist.sort()) {
    const cfg = removeHostFromConfig('blacklist', host);
    const detector = new PhishingDetector(cfg);
    const r = detector.check(host);
    if (r.result) {
      delete r.result;
      console.error(args.jsonOut
        ? JSON.stringify({host, ...r})
        : `'${host}' already covered by '${r.match}' in ${r.type}`
      )
    }
  }
  for (const host of config.whitelist.sort()) {
    const cfg = removeHostFromConfig('blacklist', host);
    const detector = new PhishingDetector(cfg);
    const r = detector.check(h);
    if (r.result) {
      delete r.result;
      console.error(args.jsonOut
        ? JSON.stringify({host, ...r})
        : `'${host}' does not require allowlisting`
      )
    }
  }
} finally {
  this.config = config;
}

