![Sprachpaket-Vorlage](banner.svg)

# Sprachpaket-Vorlage

Vorlage für ein Sprachpaket: Hostwerk selbst pflegt Deutsch und Englisch, jede weitere Sprache kommt als Erweiterung aus der Community. Mit Skript für fehlende Texte, Abdeckung in Prozent und Prüfung der Platzhalter.

[English](README.md) · Eine offizielle [Hostwerk](https://github.com/Passimoritz/hostwerk-public) Erweiterung (SDK 2.7, Seiten-Erweiterung)

## Was sie kann

- Auf GitHub „Use this template“, Sprache umbenennen (z. B. fr / Français) – fertig
- `node scripts/update.js` holt Hostwerks aktuelle Texte und schreibt, was noch fehlt, nach `lang/<id>.todo.json` (deutscher Text → englischer Hinweis)
- Abdeckung in Prozent; was fehlt, erscheint in Hostwerk auf Englisch
- Tests prüfen JSON, Platzhalter ({}) und leere Übersetzungen
- Releases kommen wie jede Erweiterung in den Community-Katalog (Erweiterungen → Einreichen)

## Installieren

In Hostwerk: **Erweiterungen → Entdecken** und „Installieren“ klicken.

## Daten

Nichts – ein Sprachpaket sind nur Dateien. Hostwerk zeigt die Sprache unter Einstellungen → Allgemein → Sprache.

## Entwickeln

```bash
node --test tests/*.test.js          # Tests
node check.js . --strict             # dieselbe Prüfung wie der Katalog (sdk/check.js)
```

Seite in `page/`. Texte im Code sind Englisch, Deutsch steht in `locales/de.json`.

## Lizenz

MIT
