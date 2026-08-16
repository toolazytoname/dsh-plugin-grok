# dsh-plugin-grok

DeepSeek Harness 插件：调用你本机**已经 `grok login` 的 Grok Build CLI**。

三个模型工具：

- `grok_ask` — 文字 / 改代码
- `grok_imagine_image` — 出图（`image_gen` / `image_edit`）
- `grok_imagine_video` — 出视频（先静帧，再 `image_to_video`）

不走 `api.x.ai`，不要 `XAI_API_KEY`，也不是 grok2api。

## 安装

```bash
dsh plugin --profile web add github:toolazytoname/dsh-plugin-grok
```

前置：安装 Grok Build，并执行 **`grok login`**（检查 `~/.grok/auth.json`）。国内请给进程带上 `https_proxy`。

开发本仓库不需要先装 DSH：`npm test` 用的是桩 `grok`。

## 限制

套餐额度照扣；视频不是文生视频；Harness 仍是开发者预览。
