# SNative CLI Monorepo

Internal workspace for SNative project scaffolding packages.

## Packages

- `packages/snative-app`: core CLI (`snative-app init`)
- `packages/create-snative-app`: `pnpm create` entry package

## Local Development

```bash
pnpm install
pnpm --filter snative-app dev
pnpm --filter snative-app run doctor
pnpm --filter create-snative-app dev
pnpm --filter snative-app scaffold:test
```

## Publish Checklist

```bash
pnpm run pack:check
pnpm run test:scaffold
```

Manual publish order:

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

## Automated Publish (GitHub Actions + OIDC)

This repository includes `.github/workflows/publish.yml` to publish on tags:

- `snative-app-v*` publishes `snative-app`
- `create-snative-app-v*` publishes `create-snative-app`

Tag examples:

```bash
git tag -a snative-app-v0.1.5 -m "snative-app v0.1.5"
git tag -a create-snative-app-v0.1.6 -m "create-snative-app v0.1.6"
git push origin snative-app-v0.1.5 create-snative-app-v0.1.6
```

In npm package settings, configure Trusted Publishing for both packages:

- Publisher: GitHub Actions
- Organization/user: `snative-app`
- Repository: `snative`
- Workflow filename: `publish.yml`
