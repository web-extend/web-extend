if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  globalThis.browser = chrome;
}

if (typeof browser !== 'undefined') {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (typeof message !== 'object') return;

    if (message.type === 'web-extend:reload-extension') {
      browser.runtime.reload();
      sendResponse({ type: 'ok' });
      return;
    }
  });

  browser.commands.onCommand.addListener((command) => {
    if (command === 'web-extend:reload-extension') {
      browser.runtime.reload();
    }
  });
}
