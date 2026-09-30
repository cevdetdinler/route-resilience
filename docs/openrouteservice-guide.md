# Softr × OpenRouteService — Routing Around Blocked Roads

**Goal:** a Softr app where the team marks roads/areas as blocked (flood, closure, collapse) and gets the fastest route that *avoids* them, how much longer it takes than normal, and a Claude-written summary of what that means.

**Why OpenRouteService (ORS), not Google:** Google's Routes API can only avoid tolls, highways, ferries, tunnels and indoor routes — there is no way to say "avoid this flooded area". ORS accepts `avoid_polygons`: any GeoJSON Polygon/MultiPolygon, and the route goes around it. Free with an API key, built on OpenStreetMap (good London coverage).

**Softr pieces used** (all confirmed available in the workspace):
- **Softr Tables** — the data
- **Workflows → Call API** — calls ORS
- **Workflows → Run custom code** (JavaScript) — geometry + maths
- **Workflows → Anthropic (Claude) → Custom prompt** — the impact summary
- **Custom code (vibe-coding) block** — the map

---

## 1. The demo moment (what judges see)

> "Albert Bridge is closed and Battersea Bridge is flooded. We need to get from the hospital in Chelsea to the care home in Battersea."

1. Mark a **Road Block** as Active on the map (centre + radius).
2. Pick **From** and **To** locations → click **Check route**.
3. App shows: blocked zone (red) · normal route (grey) · detour (blue) · **"+14 min, +3.2 km"** — or a red **CUT OFF** badge.
4. Claude writes a 3–4 line assessment and a recommended action.

---

## 2. Get an API key (5 min)

1. Sign up at <https://openrouteservice.org/dev/#/signup> (HeiGIT account).
2. Copy the API key from the dashboard.
3. Free tier for Directions: **2,000 requests/day, 40 requests/minute**. Each route check = 2 requests (normal + detour) — plenty for the day.
4. **Your key:** `<YOUR_ORS_API_KEY>`
5. In Softr, put the key **only** in the Call API step's `Authorization` header — never in a table, page or custom code block (those are visible to app users).
6. Never commit your real key; keep it only in the Softr workflow step.

---

## 3. Softr Tables (new database)

### Locations
| Field | Type | Example | Notes |
|---|---|---|---|
| Name | Text (primary) | Battersea Riverside Care Home | |
| Type | Select | Hospital, Care Home, Depot, School, Shelter, Other | |
| Criticality | Select | Low, Medium, High, Critical | |
| Latitude | Number (decimal) | 51.4760 | WGS84 |
| Longitude | Number (decimal) | -0.1640 | WGS84 |
| Notes | Long text | | |

### Road Blocks
| Field | Type | Example | Notes |
|---|---|---|---|
| Title | Text (primary) | Albert Bridge closure | |
| Cause | Select | Flooding, Road Closure, Collision, Structural, Other | |
| Severity | Select | Low, Medium, High, Critical | |
| Status | Select | Active, Cleared | Only **Active** blocks are avoided |
| Centre Latitude | Number | 51.4823 | Middle of the blocked area |
| Centre Longitude | Number | -0.1664 | |
| Radius (m) | Number | 150 | Bridges: 120–180 m. Road stretches: 150–400 m |
| Avoid Polygon | Long text | `{"type":"Polygon",…}` | Filled by the workflow; used by the map |
| Reported At | Date/time | | |

### Route Checks
| Field | Type | Notes |
|---|---|---|
| Name | Text (primary) | e.g. "Chelsea General → Battersea Riverside" |
| From | Linked record → Locations | |
| To | Linked record → Locations | |
| Profile | Select | `driving-car` (default), `driving-hgv` (trucks), `foot-walking` |
| Normal Duration (min) | Number | No avoidance |
| Detour Duration (min) | Number | Avoiding all Active blocks |
| Extra Minutes | Number | Detour − Normal |
| Normal Distance (km) | Number | |
| Detour Distance (km) | Number | |
| Reachable | Checkbox | Unticked = cut off by road |
| Normal Geometry | Long text | GeoJSON LineString (map) |
| Detour Geometry | Long text | GeoJSON LineString (map) |
| Blocks Avoided | Linked record → Road Blocks | Traceability |
| Claude Assessment | Long text | |
| Checked At | Created at | |

### Seed data — Chelsea ↔ Battersea

The Thames is the story: only a handful of bridges link Chelsea and Battersea, so closing one forces a real, visible detour — and closing enough of them can cut a site off.

| Location | Type | Side | Lat | Lng |
|---|---|---|---|---|
| Chelsea General Hospital | Hospital | North (Fulham Rd) | 51.4843 | -0.1818 |
| Chelsea Rest Centre (King's Rd school) | Shelter | North | 51.4880 | -0.1680 |
| Battersea Riverside Care Home | Care Home | South (Battersea Park Rd) | 51.4760 | -0.1640 |
| Battersea Council Depot | Depot | South (Queenstown Rd) | 51.4700 | -0.1500 |

| Road Block | Cause | Status | Lat | Lng | Radius (m) |
|---|---|---|---|---|---|
| Albert Bridge closure | Structural | Active | 51.4823 | -0.1664 | 150 |
| Battersea Bridge – Cheyne Walk flooding | Flooding | Active | 51.4812 | -0.1735 | 150 |
| Chelsea Bridge closure *(escalation)* | Road Closure | Cleared → Active live in demo | 51.4846 | -0.1500 | 150 |

**Demo escalation:** start with Albert + Battersea bridges blocked → Hospital → Care Home detours via Chelsea Bridge (+X min). Then flip **Chelsea Bridge** to Active live → the route has to go out to Wandsworth or Vauxhall Bridge (much bigger jump) or shows **CUT OFF** if you also block those. Three clicks, three escalating numbers.

Site names are fictional; bridge and road names are real. Coordinates are approximate — **open each point on a map before the demo** and nudge so every Location sits on a road (ORS snaps within ~350 m) and no Location falls inside a block's radius.

---

## 4. Workflow: "Check route"

**Trigger:** *Run custom workflow* from a button on the Route Checks form/page, passing `from_id`, `to_id`, `profile`.

```
[Trigger: button]
   │
   ├─ a. Get record: From location (lat/lng)
   ├─ b. Get record: To location (lat/lng)
   ├─ c. Find records: Road Blocks where Status = Active
   ├─ d. Run custom code: circles → MultiPolygon
   ├─ e. Call API: ORS normal route
   ├─ f. Call API: ORS detour (avoid_polygons from d)   ← "Continue on error" ON
   ├─ g. Run custom code: minutes / km / reachable
   ├─ h. Anthropic → Custom prompt: assessment
   └─ i. Create record: Route Checks
```

### 4d. Run custom code — circle → polygon (JavaScript)

```javascript
// input: blocks = [{ lat, lng, radius_m }, ...]  (from step c)
function circle(lat, lng, r, sides = 16) {
  const R = 6371000;                          // Earth radius (m)
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (2 * Math.PI * i) / sides;
    const dLat = (r * Math.cos(a)) / R;
    const dLng = (r * Math.sin(a)) / (R * Math.cos(lat * Math.PI / 180));
    pts.push([
      +(lng + dLng * 180 / Math.PI).toFixed(6),  // GeoJSON = [lng, lat]
      +(lat + dLat * 180 / Math.PI).toFixed(6)
    ]);
  }
  pts.push(pts[0]);                           // close the ring
  return [pts];                               // polygon = array of rings
}

const polys = blocks
  .filter(b => b.lat && b.lng && b.radius_m)
  .map(b => circle(b.lat, b.lng, b.radius_m));

return {
  hasBlocks: polys.length > 0,
  avoid_polygons: { type: "MultiPolygon", coordinates: polys }
};
```

### 4e / 4f. Call API — ORS Directions

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.openrouteservice.org/v2/directions/driving-car/geojson` (swap profile as needed) |
| Header `Authorization` | `<YOUR_ORS_API_KEY>` |
| Header `Content-Type` | `application/json` |

**Normal route body (4e):**
```json
{
  "coordinates": [[FROM_LNG, FROM_LAT], [TO_LNG, TO_LAT]],
  "instructions": false
}
```

**Detour body (4f):**
```json
{
  "coordinates": [[FROM_LNG, FROM_LAT], [TO_LNG, TO_LAT]],
  "instructions": true,
  "options": {
    "avoid_polygons": { "type": "MultiPolygon", "coordinates": [ "...from step 4d..." ] }
  }
}
```

⚠️ **Coordinate order is `[longitude, latitude]`** everywhere in ORS/GeoJSON. Swapping them is the #1 bug.

**Reading the response:**
| Value | Path |
|---|---|
| Duration (s) | `features[0].properties.summary.duration` |
| Distance (m) | `features[0].properties.summary.distance` |
| Route line | `features[0].geometry` (LineString) |
| Turn-by-turn | `features[0].properties.segments[0].steps` |

If there are no Active blocks, skip 4f and reuse the normal route.

### 4g. Run custom code — the numbers

```javascript
const n = normal.features[0].properties.summary;
const ok = !!(detour && detour.features && detour.features.length);
const d = ok ? detour.features[0].properties.summary : null;

return {
  normal_min: Math.round(n.duration / 60),
  normal_km: +(n.distance / 1000).toFixed(1),
  detour_min: ok ? Math.round(d.duration / 60) : null,
  detour_km: ok ? +(d.distance / 1000).toFixed(1) : null,
  extra_min: ok ? Math.round((d.duration - n.duration) / 60) : null,
  reachable: ok,
  normal_geometry: JSON.stringify(normal.features[0].geometry),
  detour_geometry: ok ? JSON.stringify(detour.features[0].geometry) : ""
};
```

If the blocks make the destination unreachable, ORS returns an error instead of a route. With **Continue on error** on step 4f, that becomes `reachable = false` — a real finding ("cut off by road"), not a crash.

### 4h. Claude prompt (Anthropic → Custom prompt)

```
You are a duty officer for a London council's resilience team.

Route check: {{From.Name}} ({{From.Type}}) → {{To.Name}} ({{To.Type}}, criticality {{To.Criticality}})
Vehicle profile: {{profile}}
Normal: {{normal_min}} min / {{normal_km}} km
Avoiding active road blocks: {{detour_min}} min / {{detour_km}} km — reachable: {{reachable}}
Active road blocks: {{list of Title + Cause + Severity}}

In at most 4 short sentences:
1. State the delay, or that the destination is cut off by road.
2. Say why it matters for this type of site.
3. Recommend one concrete action and which role should own it.
Plain English. Use only the data given.
```

---

## 5. The map (custom code block)

Softr's standard Map block shows markers only, so use a **custom code (vibe-coding) block** on the Route Check detail page with **Leaflet + OpenStreetMap tiles**:

- **Markers:** From / To (colour by Criticality)
- **Red polygons:** Active Road Blocks (`Avoid Polygon`)
- **Grey dashed line:** Normal Geometry
- **Blue line:** Detour Geometry
- **Headline tile:** `+{{Extra Minutes}} min` in large type, or a red **CUT OFF** badge

Leaflet reads GeoJSON directly: `L.geoJSON(JSON.parse(detourGeometry), { style: { color: '#2563eb', weight: 5 } }).addTo(map)`.

Stretch goal: a second page with all Locations + Active blocks on one map, so the team can see at a glance which sites sit near a block.

---

## 6. Gotchas

| Issue | Fix |
|---|---|
| `[lat, lng]` vs `[lng, lat]` | ORS / GeoJSON are always `[lng, lat]`. |
| From/To inside a blocked zone | ORS can't route — shrink the radius or move the point. |
| Point far from a road | ORS snaps to roads within ~350 m. Put points on/near the access road. |
| Huge avoid areas | Keep zones road-stretch sized. Very large polygons get rejected or are slow on the public API. |
| Rate limit (40/min) | 2 calls per check. Don't route every pair live — pre-run the demo pairs. |
| API key exposure | Only in the Call API header. Never in tables, pages or code blocks. |
| Cleared blocks still avoided | Filter step c on Status = Active. |

---

## 7. Build order for the day

1. **Before Session I:** get the ORS key; run the test below so you know it works.
2. **Session I (11:00–12:30):** create the 3 tables → seed 4 locations + 2 blocks → build workflow steps a–g → test.
3. **Session II (13:15–14:30):** Claude step → Route Checks page → Leaflet map block → rehearse the 90-second demo.
4. **Fallback:** if the map block fights you, show the Route Checks list + Claude assessment. "+14 min" carries the demo on its own.

### Quick test (terminal)

```bash
curl -X POST "https://api.openrouteservice.org/v2/directions/driving-car/geojson" \
  -H "Authorization: <YOUR_ORS_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [[-0.1818, 51.4843], [-0.1640, 51.4760]],
    "options": { "avoid_polygons": {
      "type": "MultiPolygon",
      "coordinates": [
        [[[-0.1686,51.4810],[-0.1642,51.4810],[-0.1642,51.4836],[-0.1686,51.4836],[-0.1686,51.4810]]],
        [[[-0.1757,51.4799],[-0.1713,51.4799],[-0.1713,51.4825],[-0.1757,51.4825],[-0.1757,51.4799]]]
      ]
    } }
  }'
```

That's Chelsea General Hospital → Battersea Riverside Care Home with Albert Bridge and Battersea Bridge boxed out. Run once with and once without `options`; compare `summary.duration`, and paste the returned geometry into <https://geojson.io> to see the detour.

---

## Sources
- Google Routes API — RouteModifiers (no custom-area avoidance): <https://developers.google.com/maps/documentation/routes/reference/rest/v2/RouteModifiers>
- ORS routing options (`avoid_polygons`, profiles): <https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/routing-options>
- ORS example — avoiding flooded areas: <https://openrouteservice.org/example-avoid-flooded-areas-with-ors/>
- ORS FAQ (rate limits, snapping radius): <https://giscience.github.io/openrouteservice/frequently-asked-questions.html>
- HERE Routing v8 avoid areas (alternative provider): <https://docs.here.com/routing/docs/routing-v8-avoid-area>
