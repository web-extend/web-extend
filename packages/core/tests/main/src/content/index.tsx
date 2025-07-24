import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { ContentScriptConfig } from 'web-extend';
import App from './App';

let rootEl = document.getElementById('web-extend-content');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'web-extend-content';
  document.body.appendChild(rootEl);
  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

export const config: ContentScriptConfig = {
  matches: ['https://developer.mozilla.org/*'],
};
