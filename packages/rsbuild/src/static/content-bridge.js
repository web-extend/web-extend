(() => {
  if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    globalThis.browser = chrome;
  }

  function initBridge() {
    let bridgeEl = document.getElementById('web-extend-content-bridge');
    if (!bridgeEl) {
      bridgeEl = document.createElement('div');
      bridgeEl.id = 'web-extend-content-bridge';
      document.body.appendChild(bridgeEl);
    }
  }

  function isContentChanged() {
    const bridgeEl = document.getElementById('web-extend-content-bridge');
    const contentChanged = bridgeEl?.dataset.contentChanged;
    return Boolean(contentChanged);
  }

  function reloadExtension() {
    if (isContentChanged()) {
      browser.runtime.sendMessage({ type: 'web-extend:reload-extension' });
    }
  }

  initBridge();

  if (!window.__web_extend_reloadInitialized) {
    window.__web_extend_reloadInitialized = true;
    window.addEventListener('beforeunload', reloadExtension);
  }
})();
