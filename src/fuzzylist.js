#!/usr/bin/env node
const addDomains = require("./add-domains");

addDomains('fuzzylist', process.argv.slice(2), "./src/config.json");
