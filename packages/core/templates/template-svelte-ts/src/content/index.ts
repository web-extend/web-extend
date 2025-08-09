import { mount } from 'svelte';
import type { ContentScriptConfig } from 'web-extend';
import App from './App.svelte';

let app = null;
let root = document.getElementById('my-content');
if (!root) {
  root = document.createElement('div');
  root.id = 'my-content';
  document.body.appendChild(root);
  app = mount(App, {
    target: root,
  });
}

export const config: ContentScriptConfig = {
  matches: ['https://developer.mozilla.org/*'],
};

export default app;
