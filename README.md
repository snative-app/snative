# SNative CLI Monorepo

Internal workspace for SNative project scaffolding packages.

## Packages

- `packages/snative-app`: core CLI (`snative-app init`)
- `packages/create-snative-app`: `pnpm create` entry package

## Local Development

```bash
pnpm install
pnpm --filter snative-app dev
pnpm --filter create-snative-app dev
pnpm --filter snative-app scaffold:test
```

## Publish Checklist

```bash
pnpm run pack:check
pnpm run test:scaffold
```

Then publish in this order:

```bash
pnpm --filter snative-app publish --access public
pnpm --filter create-snative-app publish --access public
```

`create-snative-app` depends on `snative-app`, so publish `snative-app` first.

Version bump guide:

```bash
# 1) bump snative-app version
# 2) bump create-snative-app version
# 3) pnpm install
# 4) pnpm run pack:check && pnpm run test:scaffold
# 5) publish in order (snative-app, then create-snative-app)
```
