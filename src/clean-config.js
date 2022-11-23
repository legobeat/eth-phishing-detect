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

const redundancies = listName === 'blocklist'
  ? config.blacklist.map(h =>
      [h, (new PhishingDetector(removeHostFromConfig(config, 'blacklist', h))).check(h)])
    .filter(([_, r]) => r.result)
    .map(([h]) => h)
  : config.whitelist.map(h =>
      [h, (new PhishingDetector(removeHostFromConfig(config, 'whitelist', h))).check(h)])
    .filter(([_, r]) => !r.result)
    .map(([h]) => h)

const cleanConfig = redundancies.reduce((cfg, h) => removeHostFromConfig(cfg, section, h), config);

process.stdout.write(JSON.stringify(cleanConfig, undefined, 2));
