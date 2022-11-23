#!/usr/bin/env node
const PhishingDetector = require('./detector')
const config = require('./config.json')

const SECTION_KEYS = {
  blocklist: 'blacklist',
  allowlist: 'whitelist',
};

const exitWithUsage = (exitCode) => {
  console.error(`Usage: ${
    process.argv.slice(0,2).join(' ')
  } ${
    Object.keys(SECTION_KEYS).join('|')
  }`);
  console.out('Removes redundant entries from config section and writes result to standard output');
  process.exit(exitCode);
};

const removeHostFromConfig = (cfg, section, host) => ({
  ...cfg,
  [section]: cfg[section].filter(h => h !== host),
});
const listName = process.argv[2];
const section = SECTION_KEYS[listName];
if (!section) {
  exitWithUsage(1);
}

const redundancyMatches = listName === 'blocklist'
  ? config.blacklist.map(h =>
  //? config.blacklist.filter(h => h === 'fulcrum.plus').map(h =>
      [h, (new PhishingDetector(removeHostFromConfig(config, 'blacklist', h))).check(h)])
    .filter(([_, r]) => r.result)
  : config.whitelist.map(h =>
      [h, (new PhishingDetector(removeHostFromConfig(config, 'whitelist', h))).check(h)])
    .filter(([_, r]) => !r.result)

// don't remove entries that are relied on by others
const redundancies = redundancyMatches.filter(([h, _]) =>
    !redundancyMatches.some(([mh, mr]) => mh !== h && mr.match === h))
    .map(([h]) => h);
const cleanConfig = redundancies.reduce((cfg, h) => removeHostFromConfig(cfg, section, h), config);

// Just in case we remove too much: see if any hosts can be added back after removing all
if (listName === 'blocklist') {
  let detector = new PhishingDetector(cleanConfig);
  for (const h of redundancies) {
    const r = detector.check(h);
    if (!r.result) {
      cleanConfig.blacklist.push(h);
      detector = new PhishingDetector(cleanConfig);
    }
  }
}

process.stdout.write(JSON.stringify(cleanConfig, undefined, 2));
