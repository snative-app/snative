# snative-app

Official SNative scaffold CLI for creating Svelte + Vite applications with optional Capacitor and Tauri runtimes.

## Standard Entry

```bash
pnpm create snative-app my-app
```

`create-snative-app` delegates to this package (`snative-app init`) and is the recommended public workflow.

## Direct CLI Usage

```bash
snative-app init [directory] [options]
```

Examples:

```bash
snative-app init
snative-app init my-app
snative-app init my-app --yes --platforms=web,ios,android
snative-app init my-app --yes --name "Acme Portal" --platforms web,macos
```

## CLI Options

- `--force`
- `--yes`
- `--name=<project-name>`
- `--name <project-name>`
- `--platforms=web,ios,android,macos,windows,linux`
- `--platforms web,ios,android,macos,windows,linux`

## Generated Project Model

- `app/`: web application source (single source of truth)
- `native/mobile/`: Capacitor runtime folder (optional)
- `native/desktop/`: Tauri runtime folder (optional)
- `snative.config.json`: project metadata and selected runtime targets
- `README.md`, `GUIDE.es.md`, `GUIDE.en.md`: onboarding and operating docs

## Runtime Commands Generated

Base:

```bash
pnpm dev
pnpm build
pnpm preview
```

If mobile targets were selected:

```bash
pnpm cap:sync
pnpm cap:add:ios
pnpm cap:add:android
pnpm cap:open:ios
pnpm cap:open:android
```

If desktop targets were selected:

```bash
pnpm desktop:dev
pnpm desktop:build
```
