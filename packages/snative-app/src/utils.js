import fs from 'node:fs/promises';
import path from 'node:path';

export function toKebabCase(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'snative-app';
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function isDirEmpty(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.length === 0;
}

export async function writeFileSafe(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

export async function writeBinaryFileSafe(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

export async function writeJson(filePath, data) {
  await writeFileSafe(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function relativeCwd(targetPath) {
  const relative = path.relative(process.cwd(), targetPath);
  return relative || '.';
}

export function hasAny(values, expected) {
  return expected.some((item) => values.includes(item));
}

export function dedupe(list) {
  return [...new Set(list)];
}

export function appIdFromName(name) {
  const slug = toKebabCase(name).replace(/-/g, '');
  return `com.snative.${slug.slice(0, 24) || 'app'}`;
}
