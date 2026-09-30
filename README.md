# RouteResilience

**See the detour before the crew does.**

RouteResilience shows emergency planners how road closures and flooding change the route between critical sites in Chelsea and Battersea, London. Mark a road block as active and the app compares the normal route with the fastest route that avoids every active block. It shows the extra minutes and kilometres on a map, and Claude writes a short note for the control room.

Built at the **Claude x Softr AI Build Day**, London, 30 September 2026.

▶️ **[Watch the 30-second demo](video/RouteResilience_demo.mp4)**

> ⚠️ **Demonstration only.** The Albert Bridge closure comes from a real TfL snapshot (TIMS-224034). All other road blocks (flooding, storm damage, burst main) are **simulated scenarios**. Journey times are free-flow estimates from OpenRouteService and ignore live traffic.

---

## How it works

```
 Softr page (React block)                 Softr Workflow "Check route instantly"
 ┌──────────────────────┐   webhook   ┌──────────────────────────────────────────┐
 │ FROM / TO + CHECK    │ ──────────► │ 1. Get Road Blocks (Softr Tables)         │
 │ ROUTE button         │             │ 2. Custom code → OpenRouteService:        │
 │                      │             │      normal route  +  route with          │
 │ Leaflet map, KPIs,   │ ◄────────── │      avoid_polygons = all Active blocks   │
 │ Claude assessment    │  record id  │ 3. Save to Route Checks                   │
 └──────────────────────┘             │ 4. Claude (Haiku 4.5) → dispatcher note   │
            ▲                         │ 5. Save assessment                        │
            │ polls Route Checks      └──────────────────────────────────────────┘
            └──────────── Softr Tables: Road Blocks · Locations · Route Checks
```

A second workflow, **Check route impact**, fires on new *Pending* Route Check records. It's a fallback for when the webhook can't be reached.

Why OpenRouteService: Google's Routes API can only avoid tolls, highways, ferries and tunnels. It can't avoid a custom area. OpenRouteService accepts `avoid_polygons` (GeoJSON), so each road block is stored as a polygon and passed straight through.

## Repository layout

| Path | What it is |
|---|---|
| `softr/pages/home-live-impact.tsx` | **Main page** (`/`): route checker, KPIs, active disruptions, Leaflet map, Claude assessment. Calls the webhook and falls back to the record trigger. |
| `softr/pages/demo.tsx` | Earlier version of the main page (`/demo`, disabled), record-trigger only |
| `softr/pages/road-blocks.tsx` | `/road-blocks` layout (not yet wired to data) |
| `softr/pages/route-checks.tsx` | `/route-checks` layout (not yet wired to data) |
| `softr/workflows/route-with-openrouteservice.js` | The custom-code step shared by both workflows |
| `softr/workflows/workflows.json` | Both workflows: triggers, steps, field mappings, Claude prompts |
| `softr/database/schema.json` | Softr Tables schema with field IDs (the page code references fields by ID) |
| `softr/database/seed/` | Locations (7 real sites) and Road Blocks (1 real + 7 simulated) |
| `docs/openrouteservice-guide.md` | Setup guide for routing around blocked roads in Softr |
| `video/` | 30-second demo video and its source (HTML + Playwright + ffmpeg) |

## Rebuilding it in Softr

1. **Database:** create a Softr Tables database with the three tables in `softr/database/schema.json` and import the seed files. Softr assigns **new field IDs**, so update the `q.select({...})` maps at the top of each page and the `D6wAy` / `psx2W` / `SOSha` references in `route-with-openrouteservice.js`.
2. **Workflows:** recreate the two workflows from `softr/workflows/workflows.json`. Paste `route-with-openrouteservice.js` into the *Run custom code* step and set `ors_key` to your own [OpenRouteService key](https://openrouteservice.org/dev/#/signup) (free: 2,000 directions requests/day).
3. **Pages:** add a custom-code (vibe-coding) block to each page, paste the matching `.tsx`, and connect the `roadBlocks`, `locations` and `routeChecks` data sources. In `home-live-impact.tsx`, set `ROUTE_WEBHOOK_URL` to your *Check route instantly* webhook URL.
4. **Access:** set page visibility to *Everyone* if you want logged-out visitors to see it, then publish.

Never commit your OpenRouteService key. It belongs only in the workflow step.

## Demo video

`video/RouteResilience_demo.mp4` (1080p, 30 s, with an original synthesised soundtrack). The routes are real OpenRouteService results: Chelsea & Westminster A&E → Battersea Fire Station, **11.3 min normally vs 17.1 min with the Battersea Bridge / Cheyne Walk / Albert Bridge closures (+6 min, via Wandsworth Bridge)**. The map is a stylised rebuild, not a screen recording.

To re-render: `pip install playwright && python video/src/render.py` (needs Chromium and ffmpeg).

## Credits

Team: Tom, Rayan, Cevdet. Built with [Softr](https://www.softr.io), [Claude](https://claude.ai) and [OpenRouteService](https://openrouteservice.org). Map data © OpenStreetMap contributors. Road closure data: Transport for London. Font: [Inter](https://rsms.me/inter/) (SIL OFL).
