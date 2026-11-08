import { readFile, writeFile } from 'node:fs/promises';
let source = await readFile(new URL('./plugin.js', import.meta.url), 'utf8');
for (const name of ['navigation', 'tree', 'search', 'find']) {
  const css = await readFile(new URL(`./${name}.css`, import.meta.url), 'utf8');
  source = source.replace(`/* ${name.toUpperCase()}_CSS */ ''`, () => JSON.stringify(css));
}
await writeFile(new URL('./index.js', import.meta.url), source);
console.log('Built index.js');
