# create-snative-app

Official entry package for `pnpm create snative-app`.

## Usage

```bash
pnpm create snative-app my-app
```

Internally this command delegates to:

```bash
snative-app init my-app
```

## Supported Options

- `--force`
- `--yes`
- `--name=<project-name>`
- `--name <project-name>`
- `--platforms=web,ios,android,macos,windows,linux`
- `--platforms web,ios,android,macos,windows,linux`

## Examples

```bash
pnpm create snative-app my-app --yes --platforms=web,ios,android
pnpm create snative-app my-app --yes --name "Acme Portal" --platforms web,macos
```

## Notes

`create-snative-app` stays intentionally thin. All scaffolding logic, templates, and runtime behavior are implemented in `snative-app`.
