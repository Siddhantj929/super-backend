import fp from 'fastify-plugin';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function routesProcessor(fastify, opts) {
  // Auto-register routes
  const modulesPath = join(__dirname, '../../modules');
  const routeFiles = [];

  // Function to traverse directory and find route files
  async function traverseDirectory(dirPath, relativePath = '') {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        await traverseDirectory(fullPath, join(relativePath, item));
      } else if (item.endsWith('.routes.js')) {
        const modulePath = `../../modules${relativePath}/${item}`;
        routeFiles.push({ modulePath, name: item.replace('.routes.js', '') });
      }
    }
  }

  // Traverse both application and domains directories
  await traverseDirectory(join(modulesPath, 'application'), '/application');
  await traverseDirectory(join(modulesPath, 'domains'), '/domains');

  // Register all found route files
  for (const routeFile of routeFiles) {
    try {
      const routeModule = await import(routeFile.modulePath);
      const routePlugin = routeModule.default;

      if (routePlugin && typeof routePlugin === 'function') {
        await fastify.register(routePlugin);
      }
    } catch (error) {
      console.warn(`Failed to load route ${routeFile.modulePath}: ${error.message}`);
    }
  }

  if (routeFiles.length > 0) {
    const routeList = routeFiles.map(route => `✓ ${route.name}`).join('\n  ');
    console.log(`Auto-registered ${routeFiles.length} route plugins:\n  ${routeList}`);
  }
}

export default fp(routesProcessor, {
  name: 'routes-processor',
});
