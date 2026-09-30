import { useEffect, useMemo, useRef, useState } from "react";
import * as LeafletNS from "leaflet";
import { AlertCircle, AlertTriangle, ArrowRight, Building2, CheckCircle2, ChevronDown, Clock3, Loader2, Route, ShieldAlert, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { datasource, useRecords, useRecordCreate, useRecordUpdate, q } from "@/lib/datasource";

const L: any = (LeafletNS as any).default ?? LeafletNS;

// Leaflet 1.9.4 core CSS (trimmed, no image rules); CSS imports are not supported by the block compiler.
const LEAFLET_CSS = ".leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane > svg,.leaflet-pane > canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile::selection{background:transparent}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-overlay-pane svg{max-width:none !important;max-height:none !important}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none !important;max-height:none !important;width:auto;padding:0}.leaflet-container img.leaflet-tile{mix-blend-mode:plus-lighter}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none}.leaflet-container{-webkit-tap-highlight-color:transparent}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,0.4)}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800}.leaflet-overlay-pane svg{-moz-user-select:none}.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}svg.leaflet-zoom-animated{will-change:transform}.leaflet-zoom-anim .leaflet-zoom-animated{-webkit-transition:-webkit-transform 0.25s cubic-bezier(0,0,0.25,1);-moz-transition:-moz-transform 0.25s cubic-bezier(0,0,0.25,1);transition:transform 0.25s cubic-bezier(0,0,0.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane > svg path,.leaflet-tile-container{pointer-events:none}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane > svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container{background:#ddd;outline-offset:1px}.leaflet-container a{color:#0078A8}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,0.5)}.leaflet-container{font-family:\"Helvetica Neue\",Arial,Helvetica,sans-serif;font-size:12px;font-size:0.75rem;line-height:1.5}.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,0.65);border-radius:4px}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:black}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px}.leaflet-container .leaflet-control-attribution{background:#fff;background:rgba(255,255,255,0.8);margin:0}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover,.leaflet-control-attribution a:focus{text-decoration:underline}.leaflet-attribution-flag{display:inline !important;vertical-align:baseline !important;width:1em;height:0.6669em}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.4)}.leaflet-tooltip.leaflet-interactive{cursor:pointer;pointer-events:auto}.leaflet-tooltip-top:before,.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:\"\"}.leaflet-tooltip-bottom{margin-top:6px}.leaflet-tooltip-top{margin-top:-6px}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}.leaflet-tooltip-left{margin-left:-6px}.leaflet-tooltip-right{margin-left:6px}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}";

const ds = datasource.define({ roadBlocks: "roadBlocks", locations: "locations", routeChecks: "routeChecks" });

// "Check route instantly" workflow (webhook). It answers as soon as the routes are saved; the AI note follows.
const ROUTE_WEBHOOK_URL = "<YOUR_CHECK_ROUTE_INSTANTLY_WEBHOOK_URL>"; // Softr → Workflows → "Check route instantly" → Webhook trigger

const roadBlockSelect = q.select({
  name: "SOSha",
  status: "D6wAy",
  closure: "8G4x9",
  severity: "VQqZP",
  directions: "4g06T",
  description: "XPGtI",
  source: "aamYX",
  polygon: "psx2W",
  snapshot: "QqgBQ",
});

const roadBlockStatusFields = q.select({ status: "D6wAy" });

const locationSelect = q.select({
  name: "MC0Z3",
  category: "eDuJe",
  side: "HKaFr",
  lat: "veTkh",
  lon: "cOgGW",
});

const checkSelect = q.select({
  label: "MpoE5",
  status: "HTNn8",
  fromName: "GdiVs",
  fromLat: "MgATx",
  fromLon: "Y1kGI",
  toName: "tttQp",
  toLat: "M72A0",
  toLon: "dhC3P",
  normalMin: "isi0y",
  normalKm: "oJRCH",
  detourMin: "9PrvG",
  detourKm: "Wt9xP",
  delayMin: "ONyB5",
  normalRoute: "0kaHV",
  detourRoute: "J3UnQ",
  blocksHit: "q886r",
  signature: "zq7oC",
  assessment: "Vr7bX",
  error: "kcNwI",
  checkedAt: "wrj14",
});

// Fallback only: used if the instant webhook can't be reached
const checkCreateFields = q.select({
  label: "MpoE5",
  status: "HTNn8",
  fromName: "GdiVs",
  fromLat: "MgATx",
  fromLon: "Y1kGI",
  toName: "tttQp",
  toLat: "M72A0",
  toLon: "dhC3P",
});

const DEFAULT_CENTER: [number, number] = [51.482, -0.167];
const DEFAULT_ZOOM = 15;
const DEFAULT_FROM = "Chelsea Fire Station";
const DEFAULT_TO = "Battersea Park";
const POLL_MS = 1000;
const POLL_TIMEOUT_MS = 120000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CATEGORY_COLOURS: Record<string, string> = {
  "Hospital": "#059669",
  "Fire station": "#ea580c",
  "Transport hub": "#7c3aed",
  "Landmark": "#475569",
};

function selLabel(s: any): string {
  if (!s) return "";
  if (typeof s === "string") return s;
  if (Array.isArray(s)) return selLabel(s[0]);
  return s.label ?? "";
}

function isActiveStatus(s: any) {
  return selLabel(s).startsWith("Active");
}

function parsePolygon(raw: any): any | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const g = JSON.parse(raw);
    if (g && (g.type === "Polygon" || g.type === "MultiPolygon") && Array.isArray(g.coordinates)) return g;
  } catch (e) {}
  return null;
}

function parseLine(raw: any): any | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const g = JSON.parse(raw);
    if (g && g.type === "LineString" && Array.isArray(g.coordinates) && g.coordinates.length > 1) return g;
  } catch (e) {}
  return null;
}

function num(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function fmtUtc(iso: any): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

function fmtTime(iso: any): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

function sourceId(src: any): string {
  const m = typeof src === "string" ? src.match(/TIMS-\d+/) : null;
  return m ? m[0] : (src ?? "");
}

function fmtMin(v: any, signed = false): string {
  const n = num(v);
  if (n === null) return "—";
  const s = n.toFixed(1).replace(/\.0$/, "");
  return signed && n > 0 ? `+${s}` : s;
}

// Status to restore when a disruption is switched back on
function activeStatusFor(b: any): string {
  return String(b.fields.closure ?? "").trim().toLowerCase() === "closed" ? "Active closure" : "Active disruption";
}

// At-risk areas: a yellow zone around each active disruption (its extent plus a buffer)
const RISK_BUFFER_M = 250;
function toXY(lon: number, lat: number, lat0: number): [number, number] {
  const R = 6371000;
  return [(lon * Math.PI / 180) * R * Math.cos(lat0 * Math.PI / 180), (lat * Math.PI / 180) * R];
}
function distM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const a = toXY(lon1, lat1, lat1), b = toXY(lon2, lat2, lat1);
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}
function riskZones(blocks: any[]): any[] {
  return blocks.map((b: any) => {
    const g = parsePolygon(b.fields.polygon);
    if (!g) return null;
    const rings = g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map((p: any) => p[0]);
    const pts = rings.flat();
    if (!pts.length) return null;
    const lon = pts.reduce((s: number, p: any) => s + p[0], 0) / pts.length;
    const lat = pts.reduce((s: number, p: any) => s + p[1], 0) / pts.length;
    let r = 0;
    for (const p of pts) r = Math.max(r, distM(lat, lon, p[1], p[0]));
    return { id: b.id, name: b.fields.name ?? "Road block", lat, lon, radius: r + RISK_BUFFER_M };
  }).filter(Boolean);
}

type MapProps = { blocks: any[]; locations: any[]; check: any | null; fromId: string; toId: string; showRisk: boolean };

function RouteMap({ blocks, locations, check, fromId, toId, showRisk }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any>(null);
  const fitKeyRef = useRef<string>("");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · Routing &copy; <a href="https://openrouteservice.org" target="_blank" rel="noopener">openrouteservice.org</a>',
    }).addTo(map);
    layersRef.current = {
      risk: L.layerGroup().addTo(map),
      locations: L.layerGroup().addTo(map),
      blocks: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map),
    };
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;
    layers.risk.clearLayers();
    layers.locations.clearLayers();
    layers.blocks.clearLayers();

    // Yellow at-risk zones (drawn underneath everything else)
    if (showRisk) for (const z of riskZones(blocks)) {
      L.circle([z.lat, z.lon], { radius: z.radius, color: "#d97706", weight: 2, opacity: 0.9, fillColor: "#fde047", fillOpacity: 0.4, interactive: true })
        .bindTooltip(`At-risk area around ${z.name}`, { sticky: true })
        .addTo(layers.risk);
    }
    layers.routes.clearLayers();

    // Road blocks (GeoJSON is lon/lat; L.geoJSON handles the axis order)
    const blockFeatures = blocks
      .map((b) => {
        const geom = parsePolygon(b.fields.polygon);
        return geom ? { type: "Feature", geometry: geom, properties: { name: b.fields.name ?? "", status: selLabel(b.fields.status) } } : null;
      })
      .filter(Boolean);
    let blockLayer: any = null;
    if (blockFeatures.length) {
      blockLayer = L.geoJSON({ type: "FeatureCollection", features: blockFeatures } as any, {
        style: () => ({ color: "#dc2626", weight: 2, fillColor: "#ef4444", fillOpacity: 0.35 }),
        onEachFeature: (f: any, lyr: any) => lyr.bindTooltip(`${f.properties.name}`, { sticky: true }),
      });
      layers.blocks.addLayer(blockLayer);
    }

    // Routes for the selected check
    let routeLayer: any = null;
    const normal = check ? parseLine(check.fields.normalRoute) : null;
    const detour = check ? parseLine(check.fields.detourRoute) : null;
    if (normal || detour) {
      routeLayer = L.featureGroup();
      if (normal) {
        L.geoJSON(normal as any, { style: () => ({ color: "#64748b", weight: 4, opacity: 0.9, dashArray: "8 8" }) })
          .bindTooltip(`Normal route · ${fmtMin(check.fields.normalMin)} min`, { sticky: true })
          .addTo(routeLayer);
      }
      if (detour) {
        L.geoJSON(detour as any, { style: () => ({ color: "#1d4ed8", weight: 5, opacity: 0.85 }) })
          .bindTooltip(`Route avoiding blocks · ${fmtMin(check.fields.detourMin)} min`, { sticky: true })
          .addTo(routeLayer);
      }
      layers.routes.addLayer(routeLayer);
    }

    // Locations
    for (const loc of locations) {
      const lat = num(loc.fields.lat), lon = num(loc.fields.lon);
      if (lat === null || lon === null) continue;
      const cat = selLabel(loc.fields.category);
      const role = loc.id === fromId ? "FROM" : loc.id === toId ? "TO" : "";
      L.circleMarker([lat, lon], {
        radius: role ? 8 : 5,
        color: "#ffffff",
        weight: 2,
        fillColor: role === "FROM" ? "#0f172a" : role === "TO" ? "#1d4ed8" : (CATEGORY_COLOURS[cat] ?? "#475569"),
        fillOpacity: 1,
      })
        .bindTooltip(`${role ? role + ": " : ""}${loc.fields.name}${cat ? " · " + cat : ""}`, { direction: "top" })
        .addTo(layers.locations);
    }

    // Only re-fit when a new route check is shown, so toggling blocks or polling never resets the user's zoom/pan
    const fitKey = check ? `${check.id}:${selLabel(check.fields.status)}` : `none:${blocks.length ? "blocks" : "empty"}`;
    if (fitKey !== fitKeyRef.current) {
      fitKeyRef.current = fitKey;
      const target = routeLayer ?? blockLayer;
      const bounds = target ? target.getBounds() : null;
      if (bounds && bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      else map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [blocks, locations, check, fromId, toId, showRisk]);

  return <>
    <style>{LEAFLET_CSS}</style>
    <div ref={containerRef} className="h-full w-full" />
  </>;
}

export default function Block() {
  const roadBlocksQ = useRecords({ from: ds.roadBlocks, select: roadBlockSelect, count: 100 });
  const locationsQ = useRecords({ from: ds.locations, select: locationSelect, count: 100 });
  const checksQ = useRecords({ from: ds.routeChecks, select: checkSelect, count: 20, orderBy: q.desc("checkedAt") });
  const createCheck = useRecordCreate({ from: ds.routeChecks, fields: checkCreateFields });
  const updateBlock = useRecordUpdate({ from: ds.roadBlocks, fields: roadBlockStatusFields });

  const allBlocks = useMemo(() => {
    const items = roadBlocksQ.data ? roadBlocksQ.data.pages.flatMap((p: any) => p.items) : [];
    return [...items].sort((a: any, b: any) => String(a.fields.name ?? "").localeCompare(String(b.fields.name ?? "")));
  }, [roadBlocksQ.data]);
  const locations = useMemo(() => {
    const items = locationsQ.data ? locationsQ.data.pages.flatMap((p: any) => p.items) : [];
    return [...items].sort((a: any, b: any) => String(a.fields.name ?? "").localeCompare(String(b.fields.name ?? "")));
  }, [locationsQ.data]);
  const checks = useMemo(() => (checksQ.data ? checksQ.data.pages.flatMap((p: any) => p.items) : []), [checksQ.data]);
  const locationsTotal = locationsQ.data?.pages?.[0]?.total ?? locations.length;
  const checksTotal = checksQ.data?.pages?.[0]?.total ?? checks.length;

  // ---- Disruption toggles (optimistic) ----
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [showRisk, setShowRisk] = useState(true);
  const [togglePending, setTogglePending] = useState(0);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const isOn = (b: any) => (b.id in overrides ? overrides[b.id] : isActiveStatus(b.fields.status));
  const active = useMemo(() => allBlocks.filter((b: any) => isOn(b)), [allBlocks, overrides]);
  const zones = useMemo(() => riskZones(active), [active]);
  const atRisk = useMemo(() => locations.map((l: any) => {
    const lat = num(l.fields.lat), lon = num(l.fields.lon);
    if (lat === null || lon === null) return null;
    const hits = zones.filter((z: any) => distM(lat, lon, z.lat, z.lon) <= z.radius);
    return hits.length ? { loc: l, zones: hits } : null;
  }).filter(Boolean) as any[], [locations, zones]);
  const currentSignature = useMemo(
    () => active.filter((b: any) => !!parsePolygon(b.fields.polygon)).map((b: any) => b.id).sort().join(","),
    [active]
  );

  async function setBlocks(targets: any[], on: boolean) {
    const changes = targets.filter((b) => isOn(b) !== on);
    if (!changes.length || !updateBlock.enabled) return;
    setToggleError(null);
    setOverrides((o) => { const n = { ...o }; changes.forEach((b) => { n[b.id] = on; }); return n; });
    setTogglePending((c) => c + 1);
    const results = await Promise.allSettled(changes.map((b) =>
      updateBlock.mutateAsync({ recordId: b.id, fields: { status: on ? activeStatusFor(b) : "Cleared" } } as any)
    ));
    await roadBlocksQ.refetch();
    setOverrides((o) => { const n = { ...o }; changes.forEach((b) => { delete n[b.id]; }); return n; });
    setTogglePending((c) => c - 1);
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed) setToggleError(`${failed} change${failed > 1 ? "s" : ""} could not be saved.`);
  }

  // ---- Route checks ----
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [awaiting, setAwaiting] = useState<{ since: number; fromName: string; toName: string } | null>(null);
  const [clickedAt, setClickedAt] = useState(0);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [reused, setReused] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!locations.length) return;
    if (!fromId) setFromId((locations.find((l: any) => l.fields.name === DEFAULT_FROM) ?? locations[0]).id);
    if (!toId) setToId((locations.find((l: any) => l.fields.name === DEFAULT_TO) ?? locations[1] ?? locations[0]).id);
  }, [locations]);

  // If the webhook didn't hand back a record id, find the new check by route and time
  useEffect(() => {
    if (!awaiting || pendingId) return;
    const match = checks.find((c: any) => c.fields.fromName === awaiting.fromName && c.fields.toName === awaiting.toName
      && new Date(c.fields.checkedAt).getTime() >= awaiting.since - 5000);
    if (match) { setPendingId(match.id); setAwaiting(null); }
  }, [checks, awaiting, pendingId]);

  const pendingCheck = pendingId ? checks.find((c: any) => c.id === pendingId) ?? null : null;
  const pendingStatus = pendingCheck ? selLabel(pendingCheck.fields.status) : "";
  const routesReady = !!pendingCheck && pendingStatus !== "Pending";
  const isRunning = !timedOut && (requesting || !!awaiting || (!!pendingId && !routesReady));
  const writingAssessment = !timedOut && !reused && routesReady && pendingStatus === "Complete" && !pendingCheck?.fields.assessment;

  useEffect(() => {
    if (routesReady && clickedAt && elapsedMs === null && !reused) setElapsedMs(Date.now() - clickedAt);
  }, [routesReady]);

  // Poll while routes or the AI note are still on their way
  useEffect(() => {
    if (!(isRunning || writingAssessment) || requesting) return;
    const t = setInterval(() => {
      if (Date.now() - clickedAt > POLL_TIMEOUT_MS) { setTimedOut(true); return; }
      checksQ.refetch();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [isRunning, writingAssessment, requesting, clickedAt]);

  const shownCheck = pendingId ? pendingCheck : (checks[0] ?? null);
  const shownStatus = shownCheck ? selLabel(shownCheck.fields.status) : "";
  const complete = shownStatus === "Complete";
  const latestComplete = checks.find((c: any) => selLabel(c.fields.status) === "Complete") ?? null;
  const shownSig = complete ? shownCheck.fields.signature : null;
  const stale = complete && !isRunning && !!shownSig && shownSig !== currentSignature;

  const fromLoc = locations.find((l: any) => l.id === fromId);
  const toLoc = locations.find((l: any) => l.id === toId);
  const canRun = !!fromLoc && !!toLoc && fromId !== toId && !isRunning && togglePending === 0;

  async function runCheck(force = false) {
    if (!canRun || !fromLoc || !toLoc) return;
    setRunError(null); setTimedOut(false); setElapsedMs(null); setReused(false); setAwaiting(null);
    const now = Date.now();
    setClickedAt(now);

    // Instant: same route with the same active disruptions has already been calculated
    if (!force) {
      const cached = checks.find((c: any) => selLabel(c.fields.status) === "Complete"
        && c.fields.fromName === fromLoc.fields.name && c.fields.toName === toLoc.fields.name
        && typeof c.fields.signature === "string" && c.fields.signature === currentSignature && c.fields.assessment);
      if (cached) { setReused(true); setPendingId(cached.id); setElapsedMs(0); return; }
    }

    const payload = {
      from_name: fromLoc.fields.name, from_lat: num(fromLoc.fields.lat), from_lon: num(fromLoc.fields.lon),
      to_name: toLoc.fields.name, to_lat: num(toLoc.fields.lat), to_lon: num(toLoc.fields.lon),
    };
    setPendingId(null);
    setRequesting(true);
    try {
      const res = await fetch(ROUTE_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      let body: any = null;
      try { body = await res.json(); } catch (e) {}
      if (!res.ok) throw new Error(`Route service returned HTTP ${res.status}`);
      const id = body?.record_id || body?.body?.record_id || null;
      if (id) setPendingId(id);
      else setAwaiting({ since: now, fromName: payload.from_name, toName: payload.to_name });
      await checksQ.refetch();
    } catch (e: any) {
      // Fallback: queue a Pending check for the record-triggered workflow (slower, but works without the webhook)
      try {
        if (!createCheck.enabled) throw e;
        const rec: any = await createCheck.mutateAsync({
          label: `${payload.from_name} → ${payload.to_name}`, status: "Pending",
          fromName: payload.from_name, fromLat: payload.from_lat, fromLon: payload.from_lon,
          toName: payload.to_name, toLat: payload.to_lat, toLon: payload.to_lon,
        } as any);
        const id = rec?.id ?? rec?.record?.id ?? null;
        if (id) setPendingId(id); else setAwaiting({ since: now, fromName: payload.from_name, toName: payload.to_name });
        await checksQ.refetch();
      } catch (e2: any) {
        setRunError(e?.message ?? "Could not start the route check.");
      }
    } finally {
      setRequesting(false);
    }
  }

  const loadingBlocks = roadBlocksQ.status === "pending";
  const blocksError = roadBlocksQ.status === "error";
  const activeCount = loadingBlocks ? "…" : blocksError ? "!" : String(active.length);

  const latestSnapshot = useMemo(() => {
    let best: any = null;
    for (const r of allBlocks) {
      if (sourceId(r.fields.source) === r.fields.source) continue; // only real TfL snapshots
      const t = r.fields.snapshot ? new Date(r.fields.snapshot).getTime() : NaN;
      if (!isNaN(t) && (!best || t > best.t)) best = { t, r };
    }
    return best?.r ?? null;
  }, [allBlocks]);
  const snapshotText = latestSnapshot ? `${sourceId(latestSnapshot.fields.source)} · ${fmtUtc(latestSnapshot.fields.snapshot)}` : loadingBlocks ? "Loading…" : "No TfL snapshot";

  const kpis: [string, any, string, string][] = [
    ["Active Road Blocks", AlertTriangle, "text-red-700 bg-red-50", activeCount],
    ["Critical Locations", Building2, "text-slate-700 bg-slate-50", locationsQ.status === "pending" ? "…" : String(locationsTotal)],
    ["Latest Route Delay", Clock3, "text-blue-700 bg-blue-50", latestComplete ? `${fmtMin(latestComplete.fields.delayMin, true)} min` : "—"],
    ["Routes Checked", Route, "text-slate-700 bg-slate-50", checksQ.status === "pending" ? "…" : String(checksTotal)],
  ];

  let statusLine: any = <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Route className="h-4 w-4"/>Pick a start and destination, then press CHECK ROUTE to compare the normal route with the safest route around active disruptions.</p>;
  if (fromId && fromId === toId) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-amber-700"><AlertCircle className="h-4 w-4"/>Choose two different locations.</p>;
  if (isRunning) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-blue-700"><Loader2 className="h-4 w-4 animate-spin"/>Calculating normal and safe routes…</p>;
  else if (runError) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-red-700"><AlertCircle className="h-4 w-4"/>{runError}</p>;
  else if (timedOut) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-red-700"><AlertCircle className="h-4 w-4"/>No result after 2 minutes. Check that the route workflows are published.</p>;
  else if (pendingId && shownStatus === "Error") statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-red-700"><AlertCircle className="h-4 w-4"/>Route check failed: {shownCheck?.fields.error || "unknown error"}</p>;
  else if (pendingId && complete && reused) statusLine = <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-emerald-700"><Zap className="h-4 w-4"/>Instant: same route and same disruptions as the check at {fmtTime(shownCheck.fields.checkedAt)}.<button onClick={() => runCheck(true)} className="font-semibold text-blue-700 underline underline-offset-2">Recalculate</button></p>;
  else if (pendingId && complete) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Routes ready{elapsedMs !== null ? ` in ${(elapsedMs / 1000).toFixed(1)} s` : ""}.</p>;
  if (stale && !isRunning) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-amber-700"><AlertCircle className="h-4 w-4"/>Disruptions have changed since the route shown was calculated. Press CHECK ROUTE to update it.</p>;

  const selectClass = "mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:bg-slate-50 disabled:text-slate-400";

  return <div className="min-h-screen bg-slate-100 text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-blue-700"/>
            <h1 className="text-xl font-bold">RouteResilience</h1>
            <span className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-900">DEMONSTRATION SCENARIO — NOT A LIVE EMERGENCY</span>
          </div>
          <p className="ml-10 text-xs text-slate-500">Chelsea / Battersea</p>
        </div>
        <div className="text-right"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">TfL snapshot</p><p className="text-xs text-emerald-700">● {snapshotText}</p></div>
      </div>
    </header>

    <main className="mx-auto max-w-[1440px] space-y-4 px-6 py-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-bold">Check route impact</h2><p className="text-xs text-slate-500">Compare the normal route with active disruption avoidance</p></div><span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">driving-car</span></div>
        <div className="grid grid-cols-[1fr_36px_1fr_170px] items-end gap-3">
          <label className="text-xs font-semibold text-slate-600">FROM
            <select className={selectClass} value={fromId} onChange={(e) => setFromId(e.target.value)} disabled={!locations.length || isRunning}>
              {!locations.length && <option value="">{locationsQ.status === "pending" ? "Loading locations…" : "No locations"}</option>}
              {locations.map((l: any) => <option key={l.id} value={l.id}>{l.fields.name}</option>)}
            </select>
          </label>
          <ArrowRight className="mb-3 h-5 w-5 text-slate-400"/>
          <label className="text-xs font-semibold text-slate-600">TO
            <select className={selectClass} value={toId} onChange={(e) => setToId(e.target.value)} disabled={!locations.length || isRunning}>
              {!locations.length && <option value="">{locationsQ.status === "pending" ? "Loading locations…" : "No locations"}</option>}
              {locations.map((l: any) => <option key={l.id} value={l.id}>{l.fields.name}</option>)}
            </select>
          </label>
          <button onClick={() => runCheck(false)} disabled={!canRun} className="flex h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50">
            {isRunning ? <><Loader2 className="h-4 w-4 animate-spin"/>CHECKING</> : "CHECK ROUTE"}
          </button>
        </div>
        {statusLine}
      </section>

      <section className="grid grid-cols-4 gap-3">
        {kpis.map(([label, Icon, style, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><span className={"rounded-md p-2 " + style}><Icon className="h-4 w-4"/></span></div><p className="mt-2 text-3xl font-bold">{value}</p></div>)}
      </section>

      <section className="grid grid-cols-[320px_minmax(0,1fr)] gap-4">
        <aside className="space-y-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-bold">Disruptions {togglePending > 0 && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400"/>}</p>
                  <p className="truncate text-xs text-slate-500">
                    {loadingBlocks ? "Loading…" : blocksError ? "Could not load Road Blocks" : `${active.length} of ${allBlocks.length} active · click to switch on/off`}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500"/>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-[min(440px,calc(100vw-32px))] p-0">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
                <div><p className="text-sm font-bold">Disruptions</p><p className="text-[11px] text-slate-500">Switched-off items are saved as Cleared and ignored by routing.</p></div>
                <div className="flex shrink-0 gap-1">
                  <button disabled={!updateBlock.enabled} onClick={() => setBlocks(allBlocks, true)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">All on</button>
                  <button disabled={!updateBlock.enabled} onClick={() => setBlocks(allBlocks, false)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">All off</button>
                </div>
              </div>
              {!updateBlock.enabled && <p className="border-b border-slate-100 px-4 py-2 text-[11px] text-amber-700">You don't have permission to change disruptions.</p>}
              {toggleError && <p className="border-b border-slate-100 px-4 py-2 text-[11px] text-red-700">{toggleError}</p>}
              <div className="max-h-[60vh] overflow-y-auto">
                {allBlocks.length === 0 && !loadingBlocks && <p className="px-4 py-3 text-xs text-slate-500">No road blocks in the table.</p>}
                {allBlocks.map((b: any) => {
                  const f = b.fields;
                  const on = isOn(b);
                  const hasPoly = !!parsePolygon(f.polygon);
                  return <div key={b.id} className={"flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 " + (on ? "" : "opacity-60")}>
                    <Switch checked={on} disabled={!updateBlock.enabled} onCheckedChange={(v: boolean) => setBlocks([b], v)} className="mt-0.5" aria-label={`Toggle ${f.name}`}/>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-5">{f.name}</p>
                        <span className={"shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase " + (on ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500")}>{on ? (b.id in overrides ? activeStatusFor(b) : selLabel(f.status)) : "Cleared"}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">{[f.severity, f.directions].filter(Boolean).join(" · ")}</p>
                      {f.description && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{f.description}</p>}
                      {f.source && <p className="mt-1 text-[10px] text-slate-400">{f.source}</p>}
                      {!hasPoly && <p className="mt-1 text-[10px] text-amber-700">No valid avoid polygon, so it is not drawn or routed around.</p>}
                    </div>
                  </div>;
                })}
              </div>
            </PopoverContent>
          </Popover>

          <div className="rounded-lg border border-blue-200 bg-blue-700 p-5 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Route impact</p>
            <p className="mt-2 text-4xl font-black">{complete ? `${fmtMin(shownCheck.fields.delayMin, true)} MIN` : "— MIN"}</p>
            {complete && <p className="mt-1 text-xs text-blue-100">{shownCheck.fields.fromName} → {shownCheck.fields.toName}</p>}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-blue-500 pt-3 text-sm">
              <div><p className="text-xs text-blue-200">Normal</p><p className="font-bold">{complete ? `${fmtMin(shownCheck.fields.normalMin)} min` : "— min"}</p>{complete && <p className="text-[11px] text-blue-200">{num(shownCheck.fields.normalKm)?.toFixed(2)} km</p>}</div>
              <div><p className="text-xs text-blue-200">Disruption</p><p className="font-bold">{complete ? `${fmtMin(shownCheck.fields.detourMin)} min` : "— min"}</p>{complete && <p className="text-[11px] text-blue-200">{num(shownCheck.fields.detourKm)?.toFixed(2)} km</p>}</div>
            </div>
            {complete && <p className="mt-3 border-t border-blue-500 pt-3 text-[11px] text-blue-100">Blocks on normal route: {shownCheck.fields.blocksHit || "None"}</p>}
          </div>
        </aside>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><div><h3 className="font-bold">Route and disruption map</h3><p className="text-xs text-slate-500">Chelsea and Battersea</p></div><div className="flex flex-col items-end gap-2"><label className="flex cursor-pointer items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900"><Switch checked={showRisk} onCheckedChange={(v: boolean) => setShowRisk(v)} aria-label="Show at-risk areas"/>Show at-risk areas</label><div className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs"><span className="text-slate-500">- - Normal route</span><span className="text-blue-700">━ Safe route</span><span className="text-red-700">■ Blocked</span>{showRisk && <span className="text-amber-600">● At-risk area</span>}</div></div></div>
          <div className="relative isolate z-0 h-[500px] overflow-hidden bg-slate-200">
            <RouteMap blocks={active} locations={locations} check={complete ? shownCheck : null} fromId={fromId} toId={toId} showRisk={showRisk}/>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-bold">Operational Assessment</h3>
          {shownCheck && <p className="text-right text-[11px] text-slate-400">{shownCheck.fields.label}{shownCheck.fields.checkedAt ? ` · ${fmtUtc(shownCheck.fields.checkedAt)}` : ""}</p>}
        </div>
        {isRunning
          ? <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/>Waiting for the route check to finish…</p>
          : writingAssessment
            ? <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/>Routes are ready; writing the AI assessment…</p>
            : shownCheck && shownCheck.fields.assessment
              ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{shownCheck.fields.assessment}</p>
              : <p className="mt-2 text-sm text-slate-500">Run CHECK ROUTE to generate an AI assessment of the latest route check.</p>}
        {shownCheck && shownCheck.fields.assessment && !isRunning && !writingAssessment && <p className="mt-3 text-[11px] text-slate-400">AI-generated from the route figures above. Demonstration only; verify before operational use.</p>}
        {showRisk && <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-800"><AlertTriangle className="h-4 w-4"/>At-risk areas ({atRisk.length})</p>
          <p className="mt-1 text-[11px] text-amber-800">Critical locations inside the yellow zones: within about {RISK_BUFFER_M} m of an active disruption. Expect access delays and diverted traffic here.</p>
          {atRisk.length === 0
            ? <p className="mt-2 text-sm text-amber-900">No critical locations are inside an at-risk area right now.</p>
            : <ul className="mt-2 space-y-1">{atRisk.map((r: any) => <li key={r.loc.id} className="text-sm text-amber-950"><span className="font-semibold">{r.loc.fields.name}</span><span className="text-amber-800"> · near {r.zones.map((z: any) => z.name).join(", ")}</span></li>)}</ul>}
        </div>}
      </section>
    </main>
  </div>
}