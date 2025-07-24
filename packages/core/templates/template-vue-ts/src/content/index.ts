import { createApp } from 'vue';
import type { ContentScriptConfig } from 'web-extend';
import App from './App.vue';

let root = document.getElementById('web-extend-content');
if (!root) {
  root = document.createElement('div');
  root.id = 'web-extend-content';
  document.body.appendChild(root);
  createApp(App).mount(root);
}

export const config: ContentScriptConfig = {
  matches: ['https://developer.mozilla.org/*'],
};
