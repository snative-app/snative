#!/usr/bin/env node
import { runCreateCli } from '../src/index.js';

runCreateCli(process.argv.slice(2)).catch((error) => {
  console.error('\n[create-snative-app] Error:', error.message);
  process.exit(1);
});
