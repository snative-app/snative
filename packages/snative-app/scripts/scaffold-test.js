#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
      env: process.env,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed: ${command} ${args.join(' ')} (exit ${code})`));
    });
  });
}

async function assertExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Missing required file: ${filePath}`);
  }
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const packageDir = path.resolve(scriptDir, '..');
  const binPath = path.join(packageDir, 'bin/snative-app.js');

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'snative-scaffold-test-'));
  const targetDir = path.join(tempRoot, 'app');

  try {
    await runCommand(
      process.execPath,
      [binPath, 'init', targetDir, '--yes', '--platforms=web,ios,android,macos,windows,linux'],
      packageDir,
    );

    const requiredFiles = [
      'package.json',
      'snative.config.json',
      'capacitor.config.json',
      'native/mobile/README.md',
      'native/desktop/src-tauri/tauri.conf.json',
      'native/desktop/src-tauri/Cargo.toml',
      'native/desktop/src-tauri/build.rs',
      'native/desktop/src-tauri/src/main.rs',
      'native/desktop/src-tauri/src/lib.rs',
      'native/desktop/src-tauri/capabilities/default.json',
      'native/desktop/src-tauri/icons/icon.png',
    ];

    for (const relativeFile of requiredFiles) {
      await assertExists(path.join(targetDir, relativeFile));
    }

    const packageJson = JSON.parse(await fs.readFile(path.join(targetDir, 'package.json'), 'utf8'));
    if (typeof packageJson.scripts?.['cap:sync'] !== 'string') {
      throw new Error('Generated package.json is missing script "cap:sync".');
    }

    if (typeof packageJson.scripts?.['desktop:dev'] !== 'string') {
      throw new Error('Generated package.json is missing script "desktop:dev".');
    }

    const capacitorConfig = JSON.parse(await fs.readFile(path.join(targetDir, 'capacitor.config.json'), 'utf8'));
    if (capacitorConfig.webDir !== 'dist') {
      throw new Error(`Expected capacitor webDir to be "dist", received "${capacitorConfig.webDir}".`);
    }

    await runCommand('pnpm', ['install'], targetDir);
    await runCommand('pnpm', ['build'], targetDir);
    await runCommand('pnpm', ['cap:sync'], targetDir);

    await fs.rm(tempRoot, { recursive: true, force: true });
  } catch (error) {
    console.error(`\n[scaffold:test] Failed. Preserved fixture at: ${tempRoot}`);
    throw error;
  }
}

main().catch((error) => {
  console.error(`\n[scaffold:test] Error: ${error.message}`);
  process.exit(1);
});
