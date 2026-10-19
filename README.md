![Language pack template](banner.svg)

# Language pack template

Template for a language pack: Hostwerk itself keeps German and English, every other language comes as an extension from the community. With a script for missing texts, coverage in percent and a check of the placeholders.

[Deutsch](README.de.md) · An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension (SDK 2.7, page extension)

## What it does

- “Use this template” on GitHub, rename the language (e.g. fr / Français) – done
- `node scripts/update.js` fetches Hostwerk's current texts and writes what is still missing into `lang/<id>.todo.json` (German text → English hint)
- Coverage in percent; what is missing appears in English in Hostwerk
- Tests check JSON, placeholders ({}) and empty translations
- Releases go into the community catalog like any extension (Extensions → Submit)

## Install

In Hostwerk: **Extensions → Discover** and click “Install”.

## Data

Nothing – a language pack is just files. Hostwerk shows the language under Settings → General → Language.

## Develop

```bash
node --test tests/*.test.js          # tests
node check.js . --strict             # same check as the catalogue (sdk/check.js)
```

Page in `page/`. Texts in the code are English, German is in `locales/de.json`.

## License

MIT
