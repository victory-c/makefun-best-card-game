// SPDX-License-Identifier: MIT
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./game/', import.meta.url));
const port = Number(process.env.PORT ?? 8080);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
createServer(async (request, response) => {
  try {
    const name = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const path = resolve(root, '.' + (name.endsWith('/') ? name + 'index.html' : name));
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep) || !(await stat(path)).isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(path));
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Lanternwake: http://127.0.0.1:${port}`));
