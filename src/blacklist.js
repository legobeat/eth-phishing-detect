#!/usr/bin/env node
const addDomains = require("./add-domains");

addDomains('blacklist', process.argv.slice(2), "./src/config.json");
