import fp from "fastify-plugin";
import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import { asClass, Lifetime } from "awilix";
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function dependencyInjection(fastify, opts) {
  // Register services using fastify-awilix
  fastify.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: false,
  });

  // Auto-register services and controllers
  const modulesPath = join(__dirname, "../../modules");
  const registrations = {};

  // Function to traverse directory and find service/controller files
  async function traverseDirectory(dirPath, relativePath = "") {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        await traverseDirectory(fullPath, join(relativePath, item));
      } else if (extname(item) === ".js") {
        const fileName = item.replace(".js", "");
        const isService = fileName.endsWith(".service");
        const isController = fileName.endsWith(".controller");

        if (isService || isController) {
          const moduleName = fileName.replace(/\.(service|controller)$/, "");
          const registrationKey = `${moduleName}${
            isService ? "Service" : "Controller"
          }`;
          const modulePath = `../../modules${relativePath}/${item}`;

          try {
            const ModuleClass = await import(modulePath);
            const DefaultExport = ModuleClass.default;

            if (DefaultExport && typeof DefaultExport === "function") {
              registrations[registrationKey] = asClass(DefaultExport, {
                lifetime: Lifetime.SINGLETON,
              });
            }
          } catch (error) {
            console.warn(`Failed to load ${modulePath}: ${error.message}`);
          }
        }
      }
    }
  }

  // Traverse both application and domains directories
  await traverseDirectory(join(modulesPath, "application"), "/application");
  await traverseDirectory(join(modulesPath, "domains"), "/domains");

  // Register all found services and controllers
  if (Object.keys(registrations).length > 0) {
    diContainer.register(registrations);

    const moduleList = Object.keys(registrations)
      .map((module) => `✓ ${module}`)
      .join("\n  ");

    console.log(
      `Auto-registered ${
        Object.keys(registrations).length
      } modules:\n  ${moduleList}`
    );
  }
}

export default fp(dependencyInjection, {
  name: "dependency-injection",
});
