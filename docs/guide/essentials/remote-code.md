# Remote Code

WebExtend will automatically download and bundle all import statements with the `https|http` prefix for fulfilling [the remote code restriction in Manifest V3](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements).

## Google Analytics

You can refer to the following code for importing [Google Analytics](https://developers.google.com/analytics/devguides/collection/ga4).

::: code-group

```ts [src/utils/analytics.ts]
import "https://www.googletagmanager.com/gtag/js?id=G-XXXXXX";

window.dataLayer = window.dataLayer || [];

export function gtag() {
  dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", "G-XXXXXX");
```

:::
