import { type Command, program } from 'commander';
import { type GenerateOptions, generate } from './generate.js';
import { init } from './init.js';
import { type StartOptions, startBuild, startDevServer } from './rsbuild.js';
import { type PreviewOptions, preview } from './runner.js';
import { type ZipOptions, zip } from './zip.js';

function runCli() {
  program.name('web-extend');

  const initCommand = program.command('init').description('create a new project');
  const generateCommand = program.command('generate').alias('g').description('generate entry files');
  const rsbuildDevCommand = program.command('dev').description('start the dev server with rsbuild');
  const rsbuildBuildCommand = program.command('build').description('build the extension for production with rsbuild');
  const previewCommand = program.command('preview').description('preview the built extension');
  const zipCommand = program.command('zip').description('package the built extension into a .zip file for publishing');

  applyInitCommand(initCommand);
  applyGenerateCommand(generateCommand);
  applyRsbuildDevCommand(rsbuildDevCommand);
  applyRsbuildBuildCommand(rsbuildBuildCommand);
  applyPreviewCommand(previewCommand);
  applyZipCommand(zipCommand);

  program.parse();
}

function applyInitCommand(command: Command) {
  command
    .argument('[dir]')
    .option('-t, --template <name>', 'specify the template name')
    .option('-e, --entry <name...>', 'specify entrypoints')
    .action(async (projectName: string, cliOptions: { entry?: string[]; template?: string }) => {
      const { entry, ...otherOptions } = cliOptions;
      const entries = entry?.flatMap((item) => item.split(','));
      try {
        await init({
          projectName,
          entries,
          ...otherOptions,
        });
      } catch (error) {
        console.error('Failed to create the project.');
        console.error(error);
        process.exit(1);
      }
    });
}

function applyGenerateCommand(command: Command) {
  command
    .argument('[entry...]', 'specify entrypoints')
    .option('-r, --root <dir>', 'specify the project root directory')
    .option('-t, --template <name>', 'specify the template name or path')
    .option('--size <size...>', 'specify sizes for output icons')
    .action(async (entry: string[] | undefined, options: GenerateOptions) => {
      try {
        options.entries = entry?.length ? entry.flatMap((item) => item.split(',')) : undefined;

        if (options.size) {
          options.size = options.size.flatMap((item) => item.split(','));
        }
        await generate(options);
      } catch (error) {
        console.error('Failed to generate.');
        console.log(error);
        process.exit(1);
      }
    });
}

function applyRsbuildDevCommand(command: Command) {
  applyCommonRunOptions(command);
  command
    .option('--open [url]', 'open the extension in browser on startup')
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
  command
    .option('-w, --watch', 'watch for changes and rebuild')
    .option('-z, --zip', 'package the built extension')
    .action(async (options: StartOptions) => {
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
    .option('-m, --mode <mode>', 'specify the build mode, can be `development`, `production` or `none`')
    .option('--env-mode <mode>', 'specify the env mode to load the `.env.[mode]` file')
    .option('--env-dir <dir>', 'specify the directory to load `.env` files')
    .option('-t, --target <target>', 'specify the extension target');
}

function applyPreviewCommand(command: Command) {
  command
    .argument('[dir]', 'specify the artifact directory')
    .option('-r, --root <root>', 'specify the project root directory')
    .option('-t, --target <target>', 'specify the extension target')
    .action(async (outDir: string, options: PreviewOptions) => {
      try {
        await preview({ ...options, outDir });
      } catch (err) {
        console.error('Failed to preview.');
        console.error(err);
        process.exit(1);
      }
    });
}

function applyZipCommand(command: Command) {
  command
    .argument('[dir]', 'specify the artifact directory')
    .option('-r, --root <root>', 'specify the project root directory')
    .option('-t, --target <target>', 'specify the extension target')
    .option('-n, --filename <filename>', 'specify the output filename')
    .action(async (outDir: string, options: ZipOptions) => {
      try {
        await zip({ ...options, outDir });
      } catch (err) {
        console.error('Failed to package the extension.');
        console.error(err);
        process.exit(1);
      }
    });
}

export { runCli };
