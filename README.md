![Language pack template](banner.svg)

# Language pack template

![Translated](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Passimoritz/hostwerk-ext-language-template/badge/coverage.json)

Template for a language pack: Hostwerk itself keeps German and English, every other language comes as an extension from the community. With a script for missing texts, coverage in percent and a check of the placeholders.

[Deutsch](README.de.md) · An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension (language pack – no page, no code that runs in Hostwerk)

## What it does

- “Use this template” on GitHub, then rename the language in `manifest.json` → `languages` (e.g. `fr` / `Français`, file `lang/fr.json`) – done
- `node scripts/update.js` fetches Hostwerk's current texts and writes what is still missing into `lang/<id>.todo.json` (German text → English hint) – plus the coverage in percent and translations that are much longer than the original
- `node scripts/pseudo.js` builds a **pseudo language** (accents, about 40 % longer, in brackets) – switch Hostwerk to it and you see where longer texts get cut off and which texts can't be translated; `node scripts/pseudo.js --remove` before a release
- Tests check JSON, placeholders (`{}`, `{name}`) and empty translations, and warn about translations that are far too long
- The **coverage badge** above is kept up to date by an Action (`.github/workflows/coverage.yml`, branch `badge`) – adjust the URL to your repository
- What is missing appears in English in Hostwerk
- Releases go into the community catalog like any extension (Extensions → Submit); the release package contains `lang/`, not the scripts

## Files

| File | What |
|---|---|
| `manifest.json` | id, name and `languages` |
| `lang/<id>.json` | your translation: `{ "texts": { "<German>": "<yours>" }, "patterns": [["Text with {}", "yours with {}"]] }` |
| `lang/<id>.todo.json` | what is still missing (written by `update.js`, not in Git) |
| `scripts/` | `update.js` and `pseudo.js` – tools for you, not part of the package |

## Install

In Hostwerk: **Extensions → Discover** and click “Install”. For testing your own copy: **Extensions → For developers → Developer mode**, then install the folder.

## Data

Nothing – a language pack is just files. Hostwerk shows the language under Settings → General → Language.

## Develop

```bash
node scripts/update.js               # what is missing, coverage, too long translations
node --test tests/*.test.js          # tests
node check.js . --strict             # same check as the catalogue (sdk/check.js)
```

Only Hostwerk's own interface is translated by language packs – the texts of extensions stay German/English for now.

## License

MIT
