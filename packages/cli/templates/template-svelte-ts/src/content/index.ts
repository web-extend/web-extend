import type { ContentScriptConfig } from '@web-extend/rsbuild-plugin';
import { mount } from 'svelte';
import App from './App.svelte';

let app = null;
let rootEl = document.getElementById('web-extend-content');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'web-extend-content';
  document.body.appendChild(rootEl);
  app = mount(App, {
    target: rootEl,
  });
}

export const config: ContentScriptConfig = {
  matches: ['https://developer.mozilla.org/*'],
};

export default app;
