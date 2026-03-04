import path from 'node:path';
import prompts from 'prompts';
import { PLATFORM_CHOICES } from './constants.js';
import { toKebabCase } from './utils.js';

const VALID_PLATFORMS = new Set(PLATFORM_CHOICES.map((choice) => choice.value));

function parseCsv(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlatforms(rawValue) {
  const parsed = parseCsv(rawValue).map((item) => item.toLowerCase());
  const normalized = [...new Set(parsed)];
  const invalid = normalized.filter((item) => !VALID_PLATFORMS.has(item));

  if (invalid.length > 0) {
    throw new Error(`Plataformas no soportadas: ${invalid.join(', ')}`);
  }

  return normalized;
}

export function parseInitFlags(argv = []) {
  const flags = {
    force: false,
    yes: false,
    name: '',
    platforms: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--force') flags.force = true;
    if (arg === '--yes') flags.yes = true;

    if (arg.startsWith('--name=')) {
      const value = arg.slice('--name='.length).trim();
      if (!value) {
        throw new Error('Debes indicar un nombre con --name=<project-name> o --name <project-name>.');
      }

      flags.name = value;
      continue;
    }

    if (arg.startsWith('--platforms=')) {
      flags.platforms = normalizePlatforms(arg.slice('--platforms='.length));
      continue;
    }

    if (arg === '--name') {
      const value = argv[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Debes indicar un valor después de --name.');
      }

      flags.name = value.trim();
      index += 1;
      continue;
    }

    if (arg === '--platforms') {
      const value = argv[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Debes indicar un valor después de --platforms.');
      }

      flags.platforms = normalizePlatforms(value);
      index += 1;
      continue;
    }

    if (arg === '--force' || arg === '--yes') {
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Flag no soportado: ${arg}`);
    }
  }

  return flags;
}

export async function shouldContinueWithNonEmptyDirectory(dirPath) {
  const dirLabel = path.basename(dirPath) || dirPath;

  const response = await prompts(
    {
      type: 'confirm',
      name: 'continue',
      message: `La carpeta ${dirLabel} no está vacía. ¿Deseas continuar y mezclar archivos?`,
      initial: false,
    },
    {
      onCancel: () => {
        throw new Error('Inicialización cancelada por el usuario.');
      },
    },
  );

  return Boolean(response.continue);
}

export async function runInitWizard({ targetDir, defaults = {}, nonInteractive = false }) {
  const defaultName = toKebabCase(defaults.name || path.basename(targetDir));

  const normalizedDefaults = {
    projectName: defaultName,
    platforms: (defaults.platforms || []).filter((item) => VALID_PLATFORMS.has(item)),
  };

  if (!normalizedDefaults.platforms.length) {
    normalizedDefaults.platforms = ['web'];
  }

  if (nonInteractive) {
    return normalizedDefaults;
  }

  console.log('\nSNative Init\n');

  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'Nombre del proyecto',
        initial: normalizedDefaults.projectName,
        validate: (value) => (String(value || '').trim() ? true : 'El nombre es obligatorio'),
      },
      {
        type: 'multiselect',
        name: 'platforms',
        message: 'Plataformas objetivo',
        instructions: false,
        hint: '',
        choices: PLATFORM_CHOICES.map((choice) => ({
          ...choice,
          selected: normalizedDefaults.platforms.includes(choice.value) || choice.selected,
        })),
        min: 1,
      },
    ],
    {
      onCancel: () => {
        throw new Error('Inicialización cancelada por el usuario.');
      },
    },
  );

  return {
    projectName: toKebabCase(answers.projectName),
    platforms: answers.platforms,
  };
}
