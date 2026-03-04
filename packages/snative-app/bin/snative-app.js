#!/usr/bin/env node
import { runCli } from '../src/cli.js';

runCli(process.argv.slice(2)).catch((error) => {
  console.error('\n[snative-app] Error:', error.message);
  process.exit(1);
});
