import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { isDevMode, matchDeclarativeMultipleEntryFile, matchDeclarativeSingleEntryFile } from './common.js';
import { parseExportObject } from './parser/export.js';
import type { ContentScriptConfig, ManifestEntryInput, ManifestEntryProcessor } from './types.js';

const key = 'content';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file) || matchDeclarativeMultipleEntryFile('contents', file);

const normalizeContentEntry: ManifestEntryProcessor['normalize'] = async ({
  manifest,
  mode,
  files,
  srcPath,
  runtime,
}) => {
  if (!manifest.content_scripts?.length) {
    const entryPath = files.filter((file) => matchDeclarativeEntryFile(file)).map((file) => resolve(srcPath, file));

    if (entryPath.length) {
      manifest.content_scripts ??= [];
      for (const filePath of entryPath) {
        manifest.content_scripts.push({
          matches: [], // get from entry in writeContentEntry
          js: [filePath],
        });
      }
    }
  }

  // inject content runtime script for each entry in dev mode
  if (isDevMode(mode) && runtime?.contentLoad) {
    const contentLoad = runtime.contentLoad;
    manifest.content_scripts?.forEach((item) => {
      if (!item.js) {
        item.js = [];
      }
      item.js.push(contentLoad);
    });
  }
};

const readContentEntry: ManifestEntryProcessor['read'] = (manifest) => {
  const { content_scripts } = manifest || {};
  if (!content_scripts?.length) return null;

  const entry: ManifestEntryInput = {};
  content_scripts.forEach((contentScript, index) => {
    const name = `content${content_scripts.length === 1 ? '' : index}`;
    const { js = [], css = [] } = contentScript;
    entry[name] = {
      input: [...js, ...css],
      html: false,
    };
  });
  return entry;
};

const writeContentEntry: ManifestEntryProcessor['write'] = async ({
  normalizedManifest,
  manifest,
  rootPath,
  name,
  input,
  output,
}) => {
  const { content_scripts } = manifest;
  if (!content_scripts?.length || !output?.length) return;

  const index = Number(name.replace('content', '') || '0');
  const normalizedContentScript = normalizedManifest.content_scripts?.[index];

  if (!content_scripts[index] || !normalizedContentScript) return;
  content_scripts[index] = JSON.parse(JSON.stringify(normalizedContentScript));

  const entryMain = input?.[0];
  const entryManinPath = resolve(rootPath, entryMain || '');
  if (entryMain && existsSync(entryManinPath)) {
    const code = await readFile(entryManinPath, 'utf-8');
    const config = parseExportObject<ContentScriptConfig>(code, 'config') || {
      matches: ['<all_urls>'],
    };
    content_scripts[index] = {
      ...content_scripts[index],
      ...config,
    };
  }

  content_scripts[index].js = output.filter((item) => item.endsWith('.js'));
  content_scripts[index].css = output.filter((item) => item.endsWith('.css'));
};

const onAfterBuild: ManifestEntryProcessor['onAfterBuild'] = async ({ distPath, manifest, mode, runtime }) => {
  const { content_scripts = [] } = manifest;
  if (!content_scripts.length) return;

  const mainContentScripts = content_scripts.filter((item) => item.world === 'MAIN');
  const ioslatedScripts = content_scripts.filter((item) => item.world !== 'MAIN').flatMap((item) => item.js || []);
  if (mainContentScripts.length && mainContentScripts.length !== content_scripts.length) {
    for (const contentScript of mainContentScripts) {
      const { js } = contentScript;
      if (!js?.length) continue;
      for (const [key, script] of Object.entries(js)) {
        if (ioslatedScripts.includes(script)) {
          const dir = dirname(script);
          const name = basename(script);
          const copyDir = join(dir, 'copy');
          const copyDirPath = resolve(distPath, copyDir);
          if (!existsSync(copyDirPath)) {
            await mkdir(copyDirPath);
          }
          await copyFile(resolve(distPath, script), resolve(copyDirPath, name));
          const index = Number(key);
          js[index] = join(copyDir, name);
        }
      }
    }
  }

  if (isDevMode(mode) && runtime?.contentBridge) {
    const contentBridgePath = runtime.contentBridge;
    const contentbridgeName = basename(contentBridgePath);
    await copyFile(contentBridgePath, resolve(distPath, contentbridgeName));
    const exists = ioslatedScripts.find((item) => item.endsWith(contentbridgeName));
    if (!exists) {
      content_scripts.push({
        matches: ['<all_urls>'],
        js: [contentbridgeName],
      });
    }
  }
};

const contentProcessor: ManifestEntryProcessor = {
  key,
  matchDeclarativeEntryFile,
  matchEntryName: (entryName) => entryName.startsWith('content'),
  normalize: normalizeContentEntry,
  read: readContentEntry,
  write: writeContentEntry,
  onAfterBuild,
};

export default contentProcessor;
