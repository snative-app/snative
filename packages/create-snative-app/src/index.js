import { initProject } from 'snative-app/init';

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
  console.log(`\ncreate-snative-app\n\nUsage:\n  pnpm create snative-app [directory] [options]\n\nOptions:\n  --help                     Show help\n  --force                    Continue even if directory is not empty\n  --yes                      Skip prompts and use defaults/flags\n  --name=<project-name>      Project name\n  --name <project-name>      Project name\n  --platforms=a,b,c          Platforms: web,ios,android,macos,windows,linux\n  --platforms a,b,c          Platforms: web,ios,android,macos,windows,linux\n`);
}

export async function runCreateCli(argv = []) {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return;
  }

  const { targetArg, flagsArgv } = extractTargetAndFlags(argv);

  await initProject({ targetArg, flagsArgv });
}
