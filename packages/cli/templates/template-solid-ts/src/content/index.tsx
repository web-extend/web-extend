import type { ContentScriptConfig } from 'web-extend';
import { render } from 'solid-js/web';
import App from './App';

let root = document.getElementById('web-extend-content');
if (!root) {
  root = document.createElement('div');
  root.id = 'web-extend-content';
  document.body.appendChild(root);
  render(() => <App />, root);
}

export const config: ContentScriptConfig = {
  matches: ['https://developer.mozilla.org/*'],
};
