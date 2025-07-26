# 远程代码 {#remote-code}

根据 [Chrome Web Store 政策](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#remove-remote-code)，在 Manifest V3 中不被允许使用远程代码。但是，你可以使用 Rspack 的 [`buildHttp`](https://rspack.rs/config/experiments#experimentsbuildhttp) 特性来支持构建远程代码。配置如下：

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

在项目中引入 [Google Analytics](https://developers.google.com/analytics/devguides/collection/ga4) 的示例代码如下。

```ts [src/utils/google-analytics.ts]
import 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXX';

window.dataLayer = window.dataLayer || [];

export function gtag() {
  dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', 'G-XXXXXX');
```
