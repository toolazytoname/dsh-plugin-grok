# dsh-plugin-grok

DeepSeek Harness 插件：调用你本机的 Grok Build CLI。登录会话和 `XAI_API_KEY` 都可以。

三个模型工具：

- `grok_ask` — 文字 / 改代码
- `grok_imagine_image` — 出图（`image_gen` / `image_edit`）
- `grok_imagine_video` — 出视频（先静帧，再 `image_to_video`）

不是 grok2api，也不自己打 Imagine HTTP。只 exec 本机 `grok`。

## 安装

```bash
dsh plugin --profile web add github:toolazytoname/dsh-plugin-grok
```

前置：安装 Grok Build，然后二选一（和官方 CLI 一样，**登录优先**）：

- **`grok login`** → `~/.grok/auth.json`（你现在这种）
- **`XAI_API_KEY`** → [console.x.ai](https://console.x.ai) 的 Token

两边都有时走登录，并清掉子进程里的 Key，避免套餐单算到 API 账单上。国内请给进程带上 `https_proxy`。

开发本仓库不需要先装 DSH：`npm test` 用的是桩 `grok`。

## 限制

套餐额度照扣；视频不是文生视频；Harness 仍是开发者预览。
