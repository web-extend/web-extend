import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import type { ContentScriptConfig } from 'rsbuild-plugin-web-ext';

let rootEl = document.getElementById('web-extend-content');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'web-extend-content';
  document.body.appendChild(rootEl);
  createApp(App).mount(rootEl);
}

export const config: ContentScriptConfig = {
  matches: ['https://developer.mozilla.org/*'],
};
