import { resolve } from 'node:path';

export const getEntryPath = (projectPath: string, entry: string) => {
  const fileName = entry === 'background' ? 'background.ts' : entry;
  return resolve(projectPath, 'src', fileName);
};
