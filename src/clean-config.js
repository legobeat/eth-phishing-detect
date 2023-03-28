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
  console.error('Removes redundant entries from config section and writes filtered config to standard output');
  process.exit(exitCode);
};

const listName = process.argv[2];
const section = SECTION_KEYS[listName];
if (!section) {
  exitWithUsage(1);
}

const resultFilter = listName === 'blocklist'
  ? r => r.result && r.type !== 'fuzzy'
  : r => !r.result;

const cleanConfig = {
  version: config.version,
  tolerance: listName === 'blockList' ? 0 : config.tolerance, // disable fuzzychecking for performance
  fuzzylist: [...config.fuzzylist],
  [SECTION_KEYS.allowlist] : [...config[SECTION_KEYS.allowlist]],
  [SECTION_KEYS.blocklist] : [...config[SECTION_KEYS.blocklist]],
};

const finalEntries = new Set();
const detector = new PhishingDetector(cleanConfig);
const baseList = detector.configs[0][listName];

for (let i = 0; i < config[section].length; i++) {
  const host = config[section][i];

  // omit current domain from current list to see if results differ without
  detector.configs[0][listName] = baseList.slice(0,i).concat(baseList.slice(i+1));
  const result = detector.check(host);

  if (!resultFilter(result)) {
    finalEntries.add(host);
  } else {
    if (listName === 'allowlist') {
      console.error(`removing redundant ${JSON.stringify({entry: host, result: result.result, tolerance: config.tolerance})}`);
    } else {
      console.error(`removing redundant ${JSON.stringify({entry: host, match: result.match, matchList: result.type})}`);
    }
  }
}

cleanConfig[section] = Array.from(finalEntries);
cleanConfig.tolerance = config.tolerance;

process.stdout.write(JSON.stringify(cleanConfig, undefined, 2)+'\n');
