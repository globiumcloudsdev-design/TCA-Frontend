import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src');

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const base = path.join(SRC, specifier.slice(2));
    for (const candidate of [`${base}.js`, `${base}.jsx`, base, path.join(base, 'index.js')]) {
      if (existsSync(candidate) && /\.[cm]?jsx?$/.test(candidate)) {
        return next(pathToFileURL(candidate).href, context);
      }
    }
  }
  if (specifier === 'next/server') return next('next/server.js', context);
  return next(specifier, context);
}
