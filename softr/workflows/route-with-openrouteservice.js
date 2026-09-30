// Softr Workflows → "Run custom code" (JavaScript) step: "Route with OpenRouteService"
// Used by both workflows. Inputs (inputData): ors_key, from_lat, from_lon, to_lat, to_lon, records (Road Blocks rows).
// The "Check route impact" (record-triggered) copy starts with this extra guard:
//   if (String(inputData['trigger_status'] || '') !== 'Pending') throw new Error('Skipped: this route check was already completed by the instant workflow');
//
// Check route impact: normal route vs route avoiding active road blocks (OpenRouteService).
return (async () => {
const ORS_KEY = String(inputData['ors_key'] || '').trim();
const from = [Number(inputData['from_lon']), Number(inputData['from_lat'])];
const to = [Number(inputData['to_lon']), Number(inputData['to_lat'])];

let records = inputData['records'];
if (typeof records === 'string') { try { records = JSON.parse(records); } catch (e) { records = []; } }
if (!Array.isArray(records)) records = records && Array.isArray(records.records) ? records.records : [];

const label = (s) => (s && typeof s === 'object') ? (s.label || '') : String(s || '');
const blocks = [];
for (const r of records) {
  const f = (r && r.fields) || {};
  if (!label(f['D6wAy']).startsWith('Active')) continue;
  let g = null;
  try { g = JSON.parse(f['psx2W'] || ''); } catch (e) {}
  if (!g || !Array.isArray(g.coordinates)) continue;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  if (polys.length) blocks.push({ id: String(r.id || ''), name: f['SOSha'] || 'Road block', status: label(f['D6wAy']), polys });
}
const signature = blocks.map((b) => b.id).sort().join(',');

// Geometry helpers (lon/lat, planar is fine at this scale)
function inRing(p, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function inPoly(p, poly) { return inRing(p, poly[0]) && !poly.slice(1).some((h) => inRing(p, h)); }
function segCross(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}
function lineHitsPoly(line, poly) {
  if (line.some((p) => inPoly(p, poly))) return true;
  for (let i = 1; i < line.length; i++) for (const ring of poly) for (let k = 1; k < ring.length; k++) {
    if (segCross(line[i - 1], line[i], ring[k - 1], ring[k])) return true;
  }
  return false;
}

function post(path, bodyStr) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openrouteservice.org', path, method: 'POST',
      headers: { 'Authorization': ORS_KEY, 'Content-Type': 'application/json', 'Accept': 'application/geo+json, application/json', 'Content-Length': Buffer.byteLength(bodyStr) },
    }, (res) => {
      let d = ''; res.setEncoding('utf8');
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, text: d }));
    });
    req.on('error', reject);
    req.setTimeout(25000, () => req.destroy(new Error('OpenRouteService timed out')));
    req.write(bodyStr); req.end();
  });
}

async function route(avoid) {
  const body = { coordinates: [from, to], instructions: false, radiuses: [-1, -1] }; // snap to nearest road however far
  if (avoid) body.options = { avoid_polygons: avoid };
  const res = await post('/v2/directions/driving-car/geojson', JSON.stringify(body));
  if (res.status !== 200) throw new Error('OpenRouteService HTTP ' + res.status + ': ' + res.text.slice(0, 300));
  const j = JSON.parse(res.text);
  const feat = j.features && j.features[0];
  if (!feat) throw new Error('OpenRouteService returned no route');
  const coords = feat.geometry.coordinates.map((c) => [Math.round(c[0] * 1e6) / 1e6, Math.round(c[1] * 1e6) / 1e6]);
  const s = feat.properties.summary || {};
  return {
    minutes: Math.round(((s.duration || 0) / 60) * 10) / 10,
    km: Math.round(((s.distance || 0) / 1000) * 100) / 100,
    geojson: JSON.stringify({ type: 'LineString', coordinates: coords }),
    coords,
  };
}

let out;
try {
  if (!ORS_KEY) throw new Error('OpenRouteService API key is not set in the workflow');
  if (from.some(isNaN) || to.some(isNaN)) throw new Error('Route check is missing FROM/TO coordinates');
  const t0 = Date.now();
  // Normal and block-avoiding routes are requested in parallel
  const avoid = blocks.length ? { type: 'MultiPolygon', coordinates: blocks.flatMap((b) => b.polys) } : null;
  const [normal, detourRes] = await Promise.all([route(null), avoid ? route(avoid) : Promise.resolve(null)]);
  const detour = detourRes || normal;
  const hit = blocks.filter((b) => b.polys.some((poly) => lineHitsPoly(normal.coords, poly)));
  const orsMs = Date.now() - t0;
  out = {
    status: 'Complete',
    normal_minutes: normal.minutes,
    normal_km: normal.km,
    detour_minutes: detour.minutes,
    detour_km: detour.km,
    delay_minutes: Math.round((detour.minutes - normal.minutes) * 10) / 10,
    normal_geojson: normal.geojson,
    detour_geojson: detour.geojson,
    active_blocks: blocks.map((b) => b.name + ' (' + b.status + ')').join('; ') || 'None',
    blocks_on_normal_route: hit.map((b) => b.name).join('; ') || 'None',
    blocks_signature: signature,
    ors_ms: orsMs,
    error: '',
  };
} catch (e) {
  out = {
    status: 'Error', normal_minutes: null, normal_km: null, detour_minutes: null, detour_km: null,
    delay_minutes: null, normal_geojson: '', detour_geojson: '',
    active_blocks: blocks.map((b) => b.name).join('; ') || 'None', blocks_on_normal_route: '',
    blocks_signature: signature, ors_ms: null,
    error: String((e && e.message) || e),
  };
}
return out;
})();
