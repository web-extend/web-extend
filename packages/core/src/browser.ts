import type { UserManifest, UserManifestFn } from '@web-extend/manifest/types';

export type Browser = typeof globalThis.chrome;

// @ts-ignore
export const browser = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;

export const defineManifest = (manifest: UserManifest | UserManifestFn) => {
  return manifest;
};
