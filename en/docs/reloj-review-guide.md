# RELOJ: automatic demonstration guide

This presentation uses sample data and illustrative screens. It does not connect real sources or publish a real dashboard.

## Three walkthroughs

- **Complete close:** SQL Server, SharePoint, API and Excel supply 10 rows. One duplicate is removed, leaving 9 records and a sample total of 5200.
- **Unavailable source:** publication is shown as blocked when a source is missing. A partial total is not presented as a complete close.
- **Recovery:** the source returns, the data is checked and a complete close is shown.

Steps advance automatically. You can pause, play, replay or switch scenarios. Progress stops when the tab is hidden or the demonstration is outside the viewport. Reduced motion or data saving produces a static result.

## Presentation code

- `/laboratorio/auto-scenes.js`: prepared scenarios, records and states.
- `/laboratorio/auto-player.js`: sequence, pause and playback.
- `/laboratorio/auto-preview.js`: illustrative dashboard and data views.

Visible changes belong to the demonstration script. A real implementation needs access, connectors, quality rules and tests against the organization's systems.
