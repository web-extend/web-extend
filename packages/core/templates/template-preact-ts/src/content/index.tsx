import { render } from 'preact';
import type { ContentScriptConfig } from 'web-extend';
import App from './App';

let root = document.getElementById('my-content');
if (!root) {
  root = document.createElement('div');
  root.id = 'my-content';
  document.body.appendChild(root);
  render(<App />, root);
}

export const config: ContentScriptConfig = {
  matches: ['https://developer.mozilla.org/*'],
};
