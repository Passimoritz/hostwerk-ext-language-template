![Sprachpaket-Vorlage](banner.svg)

# Sprachpaket-Vorlage

![Übersetzt](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Passimoritz/hostwerk-ext-language-template/badge/coverage.json)

Vorlage für ein Sprachpaket: Hostwerk selbst pflegt Deutsch und Englisch, jede weitere Sprache kommt als Erweiterung aus der Community. Mit Skript für fehlende Texte, Abdeckung in Prozent und Prüfung der Platzhalter.

[English](README.md) · Eine offizielle [Hostwerk](https://github.com/Passimoritz/hostwerk-public)-Erweiterung (Sprachpaket – keine Seite, kein Code, der in Hostwerk läuft)

## Was sie kann

- Auf GitHub „Use this template“, dann die Sprache in `manifest.json` → `languages` umbenennen (z. B. `fr` / `Français`, Datei `lang/fr.json`) – fertig
- `node scripts/update.js` holt Hostwerks aktuelle Texte und schreibt, was noch fehlt, nach `lang/<id>.todo.json` (deutscher Text → englischer Hinweis) – dazu die Abdeckung in Prozent und Übersetzungen, die viel länger als das Original sind
- `node scripts/pseudo.js` baut eine **Pseudo-Sprache** (Akzente, etwa 40 % länger, in Klammern) – Hostwerk darauf umstellen und sehen, wo längere Texte abgeschnitten werden und welche Texte sich nicht übersetzen lassen; vor einem Release `node scripts/pseudo.js --remove`
- Tests prüfen JSON, Platzhalter (`{}`, `{name}`) und leere Übersetzungen und warnen bei viel zu langen Übersetzungen
- Das **Abdeckungs-Badge** oben hält eine Action aktuell (`.github/workflows/coverage.yml`, Branch `badge`) – die Adresse auf dein Repository anpassen
- Was fehlt, erscheint in Hostwerk auf Englisch
- Releases kommen wie jede Erweiterung in den Community-Katalog (Erweiterungen → Einreichen); das Release-Paket enthält `lang/`, nicht die Skripte

## Dateien

| Datei | Was |
|---|---|
| `manifest.json` | id, Name und `languages` |
| `lang/<id>.json` | deine Übersetzung: `{ "texts": { "<Deutsch>": "<deins>" }, "patterns": [["Text mit {}", "deins mit {}"]] }` |
| `lang/<id>.todo.json` | was noch fehlt (schreibt `update.js`, nicht in Git) |
| `scripts/` | `update.js` und `pseudo.js` – Werkzeuge für dich, nicht Teil des Pakets |

## Installieren

In Hostwerk: **Erweiterungen → Entdecken** und „Installieren“ klicken. Zum Testen der eigenen Kopie: **Erweiterungen → Für Entwickler → Entwickler-Modus**, dann den Ordner installieren.

## Daten

Nichts – ein Sprachpaket sind nur Dateien. Hostwerk zeigt die Sprache unter Einstellungen → Allgemein → Sprache.

## Entwickeln

```bash
node scripts/update.js               # was fehlt, Abdeckung, zu lange Übersetzungen
node --test tests/*.test.js          # Tests
node check.js . --strict             # dieselbe Prüfung wie der Katalog (sdk/check.js)
```

Sprachpakete übersetzen nur Hostwerks eigene Oberfläche – die Texte von Erweiterungen bleiben vorerst Deutsch/Englisch.

## Lizenz

MIT
