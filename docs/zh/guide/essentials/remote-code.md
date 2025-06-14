# 远程代码 {#remote-code}

为了满足 [Manifest V3 中远程代码的限制](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#remove-remote-code)，WebExtend 会自动下载和打包所有以 `http|https` 前缀开头的 import 语句。

## Google Analytics

在项目中引入 [Google Analytics](https://developers.google.com/analytics/devguides/collection/ga4) 的示例代码如下。

```ts [src/utils/google-analytics.ts]
import "https://www.googletagmanager.com/gtag/js?id=G-XXXXXX";

window.dataLayer = window.dataLayer || [];

export function gtag() {
  dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", "G-XXXXXX");
```
