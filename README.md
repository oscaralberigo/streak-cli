# streak-cli

A Node.js CLI wrapper around the official-ish Streak SDK package [`streakapi`](https://www.npmjs.com/package/streakapi), based on the [StreakYC/node-api-wrapper](https://github.com/StreakYC/node-api-wrapper).

> This project primarily uses the SDK, with minimal direct HTTP calls for endpoints not currently exposed by `streakapi` (e.g. meetings).

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
- `streak boxes tasks <boxKey>`
- `streak boxes meetings add <boxKey> --meeting-type <type> --start <ms> --duration <ms>`
- `streak boxes meetings list <boxKey>`
- `streak meetings complete <meetingKey>`
- `streak meetings delete <meetingKey>`
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
streak boxes tasks agxzfm15c3RyZWFrchMLEgNCb3gY8fABCx
streak boxes meetings add agxzfm15c3RyZWFrchMLEgNCb3gY8fABCx --meeting-type PHONE_CALL --start 1739443200000 --duration 1800000
streak boxes meetings list agxzfm15c3RyZWFrchMLEgNCb3gY8fABCx
streak meetings complete agxzfm15c3RyZWFrchMLEgdNZWV0aW5nGJkBDA
streak meetings delete agxzfm15c3RyZWFrchMLEgdNZWV0aW5nGJkBDA
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
