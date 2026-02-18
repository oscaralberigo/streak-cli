---
name: streak-cli
description: Manage Streak CRM entities and meetings via the local `streak` CLI.
metadata:
  {
    "openclaw": {
      "requires": { "bins": ["streak"] }
    }
  }
---

# streak-cli

Use `streak` for pipelines, boxes, comments, meetings, and search.

## Auth

Set:

- `STREAK_API_KEY`

or pass `--token` per command.

## Common commands

- `streak me`
- `streak pipelines list`
- `streak pipelines boxes <pipelineKey>`
- `streak boxes get <boxKey>`
- `streak boxes meetings list <boxKey>`
- `streak search "query"`

## Notes

- Prefer `--json` when output will be parsed.
- If `streak` is not globally installed, run from this folder with `node ./src/cli.js ...`.
