/**
 * JalDrishti Server Entrypoint
 * Dispatches production bundled server (`server.js`) in production,
 * or live development server (`server.core.ts`) in development.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundlePath = path.resolve(__dirname, 'server.js');
const corePath = path.resolve(__dirname, 'server.core.ts');

const isProd = process.env.NODE_ENV === 'production';

if (isProd || !process.env.npm_lifecycle_event?.includes('dev')) {
  // Ensure production bundle exists
  if (!fs.existsSync(bundlePath) && fs.existsSync(corePath)) {
    try {
      const esbuild = await import('esbuild');
      esbuild.buildSync({
        entryPoints: [corePath],
        bundle: true,
        platform: 'node',
        format: 'esm',
        outfile: bundlePath,
        packages: 'external',
      });
    } catch (err) {
      console.warn('[Server Launcher] esbuild auto-bundle notice:', err);
    }
  }

  if (fs.existsSync(bundlePath)) {
    await import(pathToFileURL(bundlePath).href);
  } else {
    await import(pathToFileURL(corePath).href);
  }
} else {
  // Development mode via tsx
  await import(pathToFileURL(corePath).href);
}
