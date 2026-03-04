import path from 'node:path';
import { generateProject } from './generator.js';
import { parseInitFlags, runInitWizard, shouldContinueWithNonEmptyDirectory } from './prompts.js';
import { ensureDir, isDirEmpty, relativeCwd, toKebabCase } from './utils.js';

function detectTargetDir(targetArg) {
  return path.resolve(process.cwd(), targetArg || '.');
}

function defaultNameFromDir(absTargetDir) {
  return toKebabCase(path.basename(absTargetDir));
}

function printSummary(absTargetDir, generation) {
  console.log('\nSNative project created');
  console.log(`- Path: ${relativeCwd(absTargetDir)}`);
  console.log(`- Platforms: ${generation.normalizedConfig.platforms.join(', ')}`);

  if (generation.hasMobile) {
    console.log('- Mobile runtime: Capacitor');
  }

  if (generation.hasDesktop) {
    console.log('- Desktop runtime: Tauri');
  }

  console.log('\nNext steps:');
  console.log(`  cd ${relativeCwd(absTargetDir)}`);
  console.log('  pnpm install');
  console.log('  pnpm dev');
}

export async function initProject({ targetArg = '.', flagsArgv = [] } = {}) {
  const flags = parseInitFlags(flagsArgv);
  const absTargetDir = detectTargetDir(targetArg);

  await ensureDir(absTargetDir);

  if (!(await isDirEmpty(absTargetDir)) && !flags.force) {
    if (flags.yes) {
      throw new Error('La carpeta destino no está vacía. Usa --force para continuar sin confirmación.');
    }

    const ok = await shouldContinueWithNonEmptyDirectory(absTargetDir);
    if (!ok) {
      throw new Error('Inicialización cancelada por directorio no vacío.');
    }
  }

  const presetDefaults = {
    name: flags.name || defaultNameFromDir(absTargetDir),
    platforms: flags.platforms,
  };

  const wizardConfig = await runInitWizard({
    targetDir: absTargetDir,
    defaults: presetDefaults,
    nonInteractive: flags.yes,
  });

  const config = {
    ...wizardConfig,
    projectName: toKebabCase(wizardConfig.projectName),
  };

  const generation = await generateProject({
    targetDir: absTargetDir,
    config,
  });

  printSummary(absTargetDir, generation);
}
