import { initProject } from './init.js';
import { runDoctor } from './doctor.js';

function extractTargetAndFlags(argv = []) {
  let targetArg = '.';
  const flagsArgv = [];

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (!item.startsWith('-')) {
      if (targetArg !== '.') {
        throw new Error(`Argumento no soportado: ${item}`);
      }

      targetArg = item;
      continue;
    }

    flagsArgv.push(item);

    if (item === '--name' || item === '--platforms') {
      const value = argv[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error(`Falta valor para ${item}.`);
      }

      flagsArgv.push(value);
      index += 1;
    }
  }

  return { targetArg, flagsArgv };
}

function printHelp() {
  console.log(`\nSNative CLI\n\nUsage:\n  snative-app <command> [options]\n\nCommands:\n  init [directory]           Create a new SNative project\n  doctor                     Validate local environment for SNative workflows\n\nInit options:\n  --force                    Continue even if directory is not empty\n  --yes                      Skip prompts and use defaults/flags\n  --name=<project-name>      Project name\n  --name <project-name>      Project name\n  --platforms=a,b,c          Platforms: web,ios,android,macos,windows,linux\n  --platforms a,b,c          Platforms: web,ios,android,macos,windows,linux\n\nDoctor options:\n  --strict                   Fail if optional tool warnings are detected\n\nExamples:\n  snative-app init\n  snative-app init my-app\n  snative-app init my-app --yes --platforms=web,ios,android\n  snative-app doctor\n  snative-app doctor --strict\n`);
}

function parseDoctorFlags(argv = []) {
  const flags = {
    strict: false,
  };

  for (const arg of argv) {
    if (arg === '--strict') {
      flags.strict = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printHelp();
      return null;
    }

    throw new Error(`Flag no soportado para doctor: ${arg}`);
  }

  return flags;
}

export async function runCli(argv = []) {
  const [command, ...rest] = argv;

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return;
  }

  if (command === 'init') {
    const { targetArg, flagsArgv: flagArgs } = extractTargetAndFlags(rest);
    await initProject({ targetArg, flagsArgv: flagArgs });
    return;
  }

  if (command === 'doctor') {
    const flags = parseDoctorFlags(rest);
    if (!flags) {
      return;
    }

    await runDoctor(flags);
    return;
  }

  throw new Error(`Comando no soportado: ${command}`);
}
