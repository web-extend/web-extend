import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { basename, posix, resolve } from 'node:path';
import {
  getEntryName,
  isDevMode,
  matchDeclarativeMultipleEntryFile,
  matchDeclarativeSingleEntryFile,
} from './common.js';
import { parseExportObject } from './parser/export.js';
import type { ContentScriptConfig, ManifestEntryInput, ManifestEntryProcessor, Manifest } from './types.js';

const key = 'content';

const matchDeclarativeEntryFile: ManifestEntryProcessor['matchDeclarativeEntryFile'] = (file) =>
  matchDeclarativeSingleEntryFile(key, file) || matchDeclarativeMultipleEntryFile('contents', file);

const normalizeContentEntry: ManifestEntryProcessor['normalize'] = async ({ manifest, files, context }) => {
  const { rootPath, srcDir } = context;

  if (!manifest.content_scripts?.length) {
    const entryPath = files
      .filter((file) => matchDeclarativeEntryFile(file))
      .map((file) => resolve(rootPath, srcDir, file));

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
};

function getContentScriptInfo(contentScript: Manifest.ContentScript, rootPath: string, srcDir: string) {
  const { js = [], css = [] } = contentScript;
  const input = [...js, ...css];
  if (!input[0]) return null;
  const name = getEntryName(input[0], rootPath, resolve(rootPath, srcDir));
  return {
    input,
    name,
  };
}

const readEntry: ManifestEntryProcessor['readEntry'] = ({ manifest, context }) => {
  const { content_scripts } = manifest || {};
  if (!content_scripts?.length) return null;

  const entry: ManifestEntryInput = {};
  content_scripts.forEach((contentScript) => {
    const info = getContentScriptInfo(contentScript, context.rootPath, context.srcDir);
    if (!info) return;
    const { name, input } = info;
    entry[name] = {
      input,
      html: false,
    };
  });
  return entry;
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = async ({
  normalizedManifest,
  manifest,
  name,
  input,
  output,
  context,
}) => {
  const { content_scripts } = manifest;
  if (!content_scripts?.length || !output?.length) return;

  const index = (normalizedManifest.content_scripts || []).findIndex((contentScript) => {
    return getContentScriptInfo(contentScript, context.rootPath, context.srcDir)?.name === name;
  });
  if (index === -1) return;

  const normalizedContentScript = normalizedManifest.content_scripts?.[index];

  if (!content_scripts[index] || !normalizedContentScript) return;
  content_scripts[index] = JSON.parse(JSON.stringify(normalizedContentScript));

  const entryMain = input?.[0];
  const entryManinPath = resolve(context.rootPath, entryMain || '');
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

const copyContentScriptFile = async (script: string, distPath: string) => {
  const dir = posix.dirname(script);
  const name = posix.basename(script);

  const copyDir = `${dir}/copy`;
  const copyDirPath = resolve(distPath, copyDir);
  if (!existsSync(copyDirPath)) {
    await mkdir(copyDirPath);
  }

  await copyFile(resolve(distPath, script), resolve(copyDirPath, name));
  return `${copyDir}/${name}`;
};

const onAfterBuild: ManifestEntryProcessor['onAfterBuild'] = async ({ distPath, manifest, mode, runtime }) => {
  const { content_scripts = [] } = manifest;
  if (!content_scripts.length) return;

  // guarantee that main and isolated world don't have same files.
  const mainContentScripts = content_scripts.filter((item) => item.world === 'MAIN');
  const isolatedScripts = content_scripts.filter((item) => item.world !== 'MAIN').flatMap((item) => item.js || []);
  const isolatedStyles = content_scripts.filter((item) => item.world !== 'MAIN').flatMap((item) => item.css || []);

  if (mainContentScripts.length && mainContentScripts.length !== content_scripts.length) {
    for (const contentScript of mainContentScripts) {
      const { js = [], css = [] } = contentScript;

      for (let i = 0; i < js.length; i++) {
        const script = js[i];
        if (isolatedScripts.includes(script)) {
          const newName = await copyContentScriptFile(script, distPath);
          js[i] = newName;
        }
      }

      for (let i = 0; i < css.length; i++) {
        const style = css[i];
        if (isolatedStyles.includes(style)) {
          const newName = await copyContentScriptFile(style, distPath);
          css[i] = newName;
        }
      }
    }
  }

  if (isDevMode(mode) && runtime?.contentBridge) {
    const contentBridgePath = runtime.contentBridge;
    const contentbridgeName = basename(contentBridgePath);
    await copyFile(contentBridgePath, resolve(distPath, contentbridgeName));
    const exists = isolatedScripts.find((item) => item.endsWith(contentbridgeName));
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
  normalize: normalizeContentEntry,
  readEntry,
  writeEntry,
  onAfterBuild,
};

export default contentProcessor;
