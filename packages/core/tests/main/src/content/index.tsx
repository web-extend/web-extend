import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

let rootEl = document.getElementById('my-content');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'my-content';
  document.body.appendChild(rootEl);
  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

export const config = {
  matches: ['https://developer.mozilla.org/*'],
};
