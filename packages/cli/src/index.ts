import { type Command, program } from 'commander';
import { type GenerateOptions, generate } from './generate.js';
import { init } from './init.js';
import { type StartOptions, startBuild, startDevServer } from './rsbuild.js';
import { type ZipOptions, zipExtenison } from './zip.js';

function main() {
  const initCommand = program.command('init').description('create a new project');
  const generateCommand = program.command('generate').alias('g').description('generate entry files');
  const rsbuildDevCommand = program.command('rsbuild:dev').description('execute the dev command of rsbuild');
  const rsbuildBuildCommand = program.command('rsbuild:build').description('execute the build command of rsbuild');
  const zipCommand = program.command('zip').description('package an extension into a .zip file for publishing');

  applyInitCommand(initCommand);
  applyGenerateCommand(generateCommand);
  applyRsbuildDevCommand(rsbuildDevCommand);
  applyRsbuildBuildCommand(rsbuildBuildCommand);
  applyZipCommand(zipCommand);

  program.parse();
}

function applyInitCommand(command: Command) {
  command
    .argument('[dir]')
    .option('-t, --template <name>', 'specify the template name')
    .option('-e, --entry <name>', 'specify entry ponts')
    .action(async (projectName, cliOptions) => {
      const { entry, ...otherOptions } = cliOptions;
      const entrypoints = entry ? entry.split(',') : undefined;
      try {
        await init({
          projectName,
          entry: entrypoints,
          ...otherOptions,
        });
      } catch (err) {
        console.error('Failed to create the project.');
        console.error(err);
        process.exit(1);
      }
    });
}

function applyGenerateCommand(command: Command) {
  command
    .argument('<type>', 'type of files')
    .option('-r, --root <dir>', 'specify the project root directory')
    .option('-t, --template <name>', 'specify the template name or path')
    .option('-o, --out-dir <dir>', 'specify the output directory')
    .option('-n, --filename <name>', 'specify the output filename')
    .option('--size <size>', 'specify sizes of output icons (defaults to 16,32,48,64,128)')
    .action(async (type, options: GenerateOptions) => {
      try {
        options.type = type;
        if (!options.root) {
          options.root = process.cwd();
        }
        await generate(options);
        console.log(`Generated ${type} successfully!`);
      } catch (error) {
        console.error(`Generated ${type} failed.`);
        console.log(error);
        process.exit(1);
      }
    });
}

function applyRsbuildDevCommand(command: Command) {
  applyCommonRunOptions(command);
  command
    .option('-o, --open [url]', 'open the page in browser on startup')
    .option('--port <port>', 'specify a port number for server to listen')
    .action(async (options: StartOptions) => {
      try {
        await startDevServer(options);
      } catch (err) {
        console.error('Failed to start dev server.');
        console.error(err);
        process.exit(1);
      }
    });
}

function applyRsbuildBuildCommand(command: Command) {
  applyCommonRunOptions(command);
  command.option('-z, --zip', 'package the extension after build').action(async (options: StartOptions) => {
    try {
      await startBuild(options);
    } catch (err) {
      console.error('Failed to build.');
      console.error(err);
      process.exit(1);
    }
  });
}

function applyCommonRunOptions(command: Command) {
  command
    .option('-r, --root <root>', 'specify the project root directory')
    .option('-c --config <config>', 'specify the configuration file')
    .option('-m --mode <mode>', 'specify the build mode, can be `development`, `production` or `none`')
    .option('--env-mode <mode>', 'specify the env mode to load the `.env.[mode]` file')
    .option('--env-dir <dir>', 'specify the directory to load `.env` files')
    .option('-t, --target <target>', 'specify the extension target');
}

function applyZipCommand(command: Command) {
  command
    .argument('<source>', 'specify the dist path')
    .option('-r, --root <root>', 'specify the project root directory')
    .option('-o, --out-dir <dir>', 'specify the output directory')
    .option('-n, --filename <filename>', 'specify the output filename')
    .action(async (source: string, options: ZipOptions) => {
      try {
        await zipExtenison({ ...options, source });
      } catch (err) {
        console.error('Failed to package the extension.');
        console.error(err);
        process.exit(1);
      }
    });
}

export { main };
