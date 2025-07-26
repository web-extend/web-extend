# Remote Code

In Manifest V3, the remote code is not allowed according to the [Chrome Web Store policy](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#remove-remote-code). Never mind, you can use Rspack's [`buildHttp`](https://rspack.rs/config/experiments#experimentsbuildhttp) feature to support building remote code. The configuration is as follows:

```ts [rsbuild.config.ts]
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  tools: {
    rspack: {
      experiments: {
        buildHttp: {
          allowedUris: [/https?:\/\//],
        },
      },
    },
  },
});
```

## Google Analytics

You can refer to the following code for importing [Google Analytics](https://developers.google.com/analytics/devguides/collection/ga4).

```ts [src/utils/analytics.ts]
import 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXX';

window.dataLayer = window.dataLayer || [];

export function gtag() {
  dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', 'G-XXXXXX');
```
