if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  globalThis.browser = chrome;
}

if (__webpack_require__.l && !__webpack_require__.l.origin) {
  function flagContentChanged() {
    const bridgeEl = document.getElementById('web-extend-content-bridge');
    if (bridgeEl) {
      bridgeEl.dataset.contentChanged = 'true';
    }
  }

  function initializeWebpackLoader() {
    const inProgress = {};
    const originLoad = __webpack_require__.l;
    __webpack_require__.l.origin = originLoad;

    __webpack_require__.l = (url, done, ...args) => {
      flagContentChanged();

      if (typeof browser !== 'object' || !browser.runtime) {
        return originLoad(url, done, ...args);
      }

      // custom load
      if (inProgress[url]) {
        inProgress[url].push(done);
        return;
      }

      inProgress[url] = [done];
      const onScriptComplete = (event) => {
        const doneFns = inProgress[url];
        delete inProgress[url];
        doneFns?.forEach((fn) => fn(event));
      };
      const CHUNK_LOAD_TIMEOUT = 120000;
      setTimeout(onScriptComplete, CHUNK_LOAD_TIMEOUT);

      const file = url.split('/').at(-1);
      browser.runtime
        .sendMessage({ type: 'web-extend:execute-script', file })
        .then(onScriptComplete)
        .catch(onScriptComplete);
    };
  }

  initializeWebpackLoader();
}
