# dsh-plugin-grok

DeepSeek Harness plugin that drives **your already-logged-in local Grok Build CLI**.

One worker, three jobs:

| Tool | When the model should call it |
| --- | --- |
| `grok_ask` | Text, review, planning, code |
| `grok_imagine_image` | Still images (`image_gen` / `image_edit`) |
| `grok_imagine_video` | Clips — still first, then `image_to_video` |

It does **not** call `api.x.ai`, does **not** need `XAI_API_KEY`, and is **not** grok2api. Auth is `grok login` on that machine.

[中文说明](./README.zh.md)

## Install

```bash
dsh plugin --profile web add github:toolazytoname/dsh-plugin-grok
```

Then restart `dsh web` and hard-refresh the browser.

If pnpm ≥ 10 blocks the git `prepare` script, allow the build once in that profile:

```bash
# in ~/.dsh/profiles/web/pnpm-workspace.yaml
allowBuilds:
  dsh-plugin-grok: true
```

Or install from a local checkout:

```bash
dsh plugin --profile web add /absolute/path/to/dsh-plugin-grok
```

## Prerequisite

1. Install [Grok Build](https://docs.x.ai/build/overview) so `grok` is on `PATH` (usually `~/.grok/bin/grok`).
2. Run **`grok login`**. This plugin looks for `~/.grok/auth.json` and refuses to start without it.
3. In mainland China, set `https_proxy` / `HTTPS_PROXY` (Clash mixed port, often `http://127.0.0.1:7891`). The plugin forwards those vars and **unsets** `XAI_API_KEY`.

You do **not** need a live DSH session to develop or test this repo (`npm test` uses a stub `grok`).

## What the model gets

- **`grok_ask`** — `grok --prompt-file … --always-approve` with the full coding toolset.
- **`grok_imagine_image`** — same CLI, tools restricted to `image_gen,image_edit`. Returns absolute image path(s).
- **`grok_imagine_video`** — Grok has no text-to-video. The prompt tells Grok to stage a still, then call `image_to_video`. Returns absolute video path(s).

Missing `grok`, missing login, empty prompt, non-zero exit, or a media run with no parseable path all **fail closed**.

## CLI (optional)

```bash
npx dsh-plugin-grok status
npx dsh-plugin-grok ask "summarize this repo"
npx dsh-plugin-grok image "a red cube on a table" --ratio 1:1
npx dsh-plugin-grok video "slow cinematic push-in" --duration 6 --resolution 480p
```

## Known limits

- SuperGrok / coding-plan **quota** still applies. Image and video are slow and spend Imagine.
- Video is still-then-animate, not native text-to-video. Default `6s` / `480p`. Cap is `720p`.
- One local `grok` process per tool call. No ACP / `grok agent stdio` wrapper.
- DeepSeek Harness is a developer preview; the Cordis `apply` + `ctx.tools.register` contract may drift.
- This is the worker, not a kanban or budget butler.

## Develop

```bash
npm install
npm run check
```

## License

MIT
