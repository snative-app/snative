import os from 'node:os';
import { spawnSync } from 'node:child_process';

const MIN_NODE_MAJOR = 18;

function firstLine(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean) || '';
}

function runBinary(binary, args = ['--version']) {
  const result = spawnSync(binary, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      return {
        found: false,
        detail: 'not installed',
      };
    }

    return {
      found: false,
      detail: result.error.message || 'command failed',
    };
  }

  const output = firstLine(`${result.stdout || ''}\n${result.stderr || ''}`);
  if (result.status !== 0) {
    return {
      found: false,
      detail: output || `exit code ${result.status}`,
    };
  }

  return {
    found: true,
    detail: output || 'detected',
  };
}

function checkNodeVersion() {
  const version = process.versions.node || 'unknown';
  const major = Number(version.split('.')[0]);
  const ok = Number.isFinite(major) && major >= MIN_NODE_MAJOR;

  if (!ok) {
    return {
      status: 'fail',
      name: 'Node.js',
      detail: `v${version} detected (required >= ${MIN_NODE_MAJOR})`,
    };
  }

  return {
    status: 'ok',
    name: 'Node.js',
    detail: `v${version}`,
  };
}

function checkBinary({ name, binary, args, required, when = () => true, missingHint = '' }) {
  if (!when()) {
    return null;
  }

  const check = runBinary(binary, args);
  if (!check.found) {
    return {
      status: required ? 'fail' : 'warn',
      name,
      detail: `${check.detail}${missingHint ? ` (${missingHint})` : ''}`,
    };
  }

  return {
    status: 'ok',
    name,
    detail: check.detail,
  };
}

function printResult(result) {
  const labels = {
    ok: 'OK',
    warn: 'WARN',
    fail: 'FAIL',
  };

  console.log(`[${labels[result.status]}] ${result.name}: ${result.detail}`);
}

function summarize(results = []) {
  return results.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { ok: 0, warn: 0, fail: 0 },
  );
}

export async function runDoctor({ strict = false } = {}) {
  const isMac = os.platform() === 'darwin';

  const checks = [
    checkNodeVersion(),
    checkBinary({
      name: 'pnpm',
      binary: 'pnpm',
      required: true,
      missingHint: 'required for package management',
    }),
    checkBinary({
      name: 'git',
      binary: 'git',
      required: true,
      missingHint: 'required for source control operations',
    }),
    checkBinary({
      name: 'rustc',
      binary: 'rustc',
      required: false,
      missingHint: 'needed for Tauri desktop builds',
    }),
    checkBinary({
      name: 'cargo',
      binary: 'cargo',
      required: false,
      missingHint: 'needed for Tauri desktop builds',
    }),
    checkBinary({
      name: 'xcodebuild',
      binary: 'xcodebuild',
      args: ['-version'],
      required: false,
      when: () => isMac,
      missingHint: 'needed for iOS builds on macOS',
    }),
    checkBinary({
      name: 'adb',
      binary: 'adb',
      args: ['version'],
      required: false,
      missingHint: 'needed for Android device debugging',
    }),
    checkBinary({
      name: 'java',
      binary: 'java',
      args: ['-version'],
      required: false,
      missingHint: 'needed for Android toolchain',
    }),
  ].filter(Boolean);

  console.log('\nSNative Doctor\n');
  console.log(`[INFO] Platform: ${os.platform()} ${os.release()}`);

  for (const check of checks) {
    printResult(check);
  }

  const totals = summarize(checks);
  console.log(`\nSummary: ${totals.ok} ok, ${totals.warn} warnings, ${totals.fail} failures.`);

  if (totals.fail > 0) {
    throw new Error('Doctor found required tooling failures.');
  }

  if (strict && totals.warn > 0) {
    throw new Error('Doctor strict mode failed due to warnings.');
  }
}
