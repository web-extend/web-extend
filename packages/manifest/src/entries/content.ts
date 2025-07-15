import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { basename, posix, resolve } from 'node:path';
import {
  getMultipleDeclarativeEntryFile,
  getSingleDeclarativeEntryFile,
  isDevMode,
  matchMultipleDeclarativeEntryFile,
  matchSingleDeclarativeEntryFile,
} from '../common.js';
import { parseExportObject } from '../parser/export.js';
import type {
  ContentScriptConfig,
  DeclarativeEntryFileResult,
  ManifestContentScript,
  ManifestEntryProcessor,
  WebExtendContentEntryInput,
} from '../types.js';

const key = 'contents';

const matchDeclarativeEntry: ManifestEntryProcessor['matchDeclarativeEntry'] = (filePath, context) => {
  return (
    matchSingleDeclarativeEntryFile(filePath, 'content', context) ||
    matchMultipleDeclarativeEntryFile(filePath, 'contents', context)
  );
};

const normalizeEntry: ManifestEntryProcessor['normalizeEntry'] = async ({ manifest, context, entries }) => {
  let declarativeResult: DeclarativeEntryFileResult[] | null = null;
  if (!manifest.content_scripts?.length) {
    const singleEntry = await getSingleDeclarativeEntryFile('content', context);
    const multipleEntry = await getMultipleDeclarativeEntryFile('contents', context);
    declarativeResult = [singleEntry[0], ...multipleEntry].filter(Boolean);
    for (const item of declarativeResult) {
      manifest.content_scripts ??= [];
      manifest.content_scripts.push({
        js: [item.path],
      } as ManifestContentScript);
    }
  }

  const { content_scripts } = manifest || {};
  if (content_scripts?.length) {
    const entry: WebExtendContentEntryInput[] = [];
    content_scripts.forEach((contentScript, index) => {
      const { js = [], css = [] } = contentScript;
      const name = declarativeResult ? declarativeResult[index].name : `${key}/${index}`;
      entry.push({
        name,
        import: [...js, ...css],
        type: 'script',
        config: contentScript,
      });
    });

    if (entry.length) {
      entries[key] = entry;
    }
  }
};

const writeEntry: ManifestEntryProcessor['writeEntry'] = async ({ manifest, name, output, context, entries }) => {
  const { content_scripts } = manifest;
  if (!content_scripts?.length || !output?.length) return;

  const entry = entries[key] || [];
  const index = entry.findIndex((item) => item.name === name);
  if (index === -1 || !content_scripts[index]) return;

  const { rootPath } = context;
  const entryConfig = entry[index].config || ({} as ManifestContentScript);
  content_scripts[index] = {
    ...entryConfig,
    js: [],
    css: [],
  };

  const entryMain = entry[index].import?.[0];
  const entryManinPath = resolve(rootPath, entryMain || '');
  if (entryMain && existsSync(entryManinPath)) {
    const code = await readFile(entryManinPath, 'utf-8');
    const config = parseExportObject<ContentScriptConfig>(code, 'config') || {
      matches: ['<all_urls>'],
    };
    content_scripts[index] = {
      ...config, // avoid override original config
      ...content_scripts[index],
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
  matchDeclarativeEntry,
  normalizeEntry,
  writeEntry,
  onAfterBuild,
};

export default contentProcessor;
