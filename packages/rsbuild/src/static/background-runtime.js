if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  globalThis.browser = chrome;
}

if (typeof browser !== 'undefined') {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (typeof message !== 'object') return;

    if (message.type === 'web-extend:reload-extension') {
      browser.runtime.reload();
      sendResponse({ type: 'ok' });
      return;
    }

    if (message.type === 'web-extend:execute-script') {
      const tabId = sender.tab?.id;
      const file = message.file;
      if (tabId && file) {
        browser.scripting
          .executeScript({
            target: { tabId },
            files: [file],
          })
          .then(() => {
            sendResponse({ code: 0 });
          })
          .catch((error) => {
            sendResponse({ code: -1, error });
          });
      }
      return true;
    }
  });

  browser.commands.onCommand.addListener((command) => {
    if (command === 'web-extend:reload-extension') {
      browser.runtime.reload();
    }
  });
}
