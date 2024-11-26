const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: 'Hello Extensions',
  description: 'Base Level Extension',
  version: '1.0',
  background: {
    service_worker: './src/background',
  },
  content_scripts: [
    {
      js: ['./src/content.ts'],
      css: ['./src/content.css'],
      matches: ['<all_urls>'],
    },
  ],
  action: {
    default_popup: './src/popup.ts',
  },
  options_ui: {
    page: './src/options',
    open_in_tab: true,
  },
  devtools_page: './src/devtools.ts',
};

export default manifest;
