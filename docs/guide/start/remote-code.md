# Remote Code

WebExtend automatically downloads and bundles all import statements with the `https|http` prefix, for [the remote resource restriction in MV3](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements).

## Google Analytics

::: code-group

```ts [utils/analytics.ts]
import "https://www.googletagmanager.com/gtag/js?id=G-XXXXXX";

window.dataLayer = window.dataLayer || [];

export function gtag() {
  dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", "G-XXXXXX");
```

:::

For document, see [Google Analytics](https://developers.google.com/analytics/devguides/collection/ga4).
