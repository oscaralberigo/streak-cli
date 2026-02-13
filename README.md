# streak-cli

A Node.js CLI wrapper around the official-ish Streak SDK package [`streakapi`](https://www.npmjs.com/package/streakapi), based on the [StreakYC/node-api-wrapper](https://github.com/StreakYC/node-api-wrapper).

> This project is a CLI over the SDK (not a direct HTTP client).

## Quick start

```bash
npm install
npm run start -- --help
```

### Install as local command

```bash
npm link
streak --help
```

## Authentication

Set your Streak API token using environment variables:

```bash
export STREAK_API_KEY="your_api_key_here"
```

Or pass a token per command:

```bash
streak --token your_api_key_here me
```

## Commands

- `streak me`
- `streak pipelines list`
- `streak pipelines boxes <pipelineKey>`
- `streak boxes get <boxKey>`
- `streak boxes comments <boxKey>`
- `streak search <query>`

Global flags:

- `--json` raw output
- `--token <apiKey>` override env token

## Examples

```bash
streak me
streak pipelines list
streak pipelines boxes agxzfm15c3RyZWFrchMLEghQaXBlbGluZRjP0gEM
streak boxes get agxzfm15c3RyZWFrchMLEgNCb3gY8fABCx
streak boxes comments agxzfm15c3RyZWFrchMLEgNCb3gY8fABCx
streak search "acme renewal"
```

JSON mode:

```bash
streak --json pipelines list
```

## Development

```bash
npm run dev -- --help
npm test
```

## Project structure

- `src/cli.js` executable entrypoint
- `src/main.js` orchestration and error handling
- `src/commands/` command modules (extensible for custom workflows)
- `src/lib/` shared helpers (args/auth/errors/output)
- `test/` minimal parser/auth coverage

This command module layout is intended to make adding Oscar-specific workflow commands straightforward (drop-in command modules + routing in `src/commands/index.js`).
