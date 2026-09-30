import { useEffect, useMemo, useRef, useState } from "react";
import * as LeafletNS from "leaflet";
import { AlertCircle, AlertTriangle, ArrowRight, Building2, CheckCircle2, Clock3, Loader2, Route, ShieldAlert } from "lucide-react";
import { datasource, useRecords, useRecordCreate, q } from "@/lib/datasource";

const L: any = (LeafletNS as any).default ?? LeafletNS;

// Leaflet 1.9.4 core CSS (trimmed, no image rules); CSS imports are not supported by the block compiler.
const LEAFLET_CSS = ".leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane > svg,.leaflet-pane > canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile::selection{background:transparent}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-overlay-pane svg{max-width:none !important;max-height:none !important}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none !important;max-height:none !important;width:auto;padding:0}.leaflet-container img.leaflet-tile{mix-blend-mode:plus-lighter}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none}.leaflet-container{-webkit-tap-highlight-color:transparent}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,0.4)}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800}.leaflet-overlay-pane svg{-moz-user-select:none}.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}svg.leaflet-zoom-animated{will-change:transform}.leaflet-zoom-anim .leaflet-zoom-animated{-webkit-transition:-webkit-transform 0.25s cubic-bezier(0,0,0.25,1);-moz-transition:-moz-transform 0.25s cubic-bezier(0,0,0.25,1);transition:transform 0.25s cubic-bezier(0,0,0.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane > svg path,.leaflet-tile-container{pointer-events:none}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane > svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container{background:#ddd;outline-offset:1px}.leaflet-container a{color:#0078A8}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,0.5)}.leaflet-container{font-family:\"Helvetica Neue\",Arial,Helvetica,sans-serif;font-size:12px;font-size:0.75rem;line-height:1.5}.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,0.65);border-radius:4px}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:black}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px}.leaflet-container .leaflet-control-attribution{background:#fff;background:rgba(255,255,255,0.8);margin:0}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover,.leaflet-control-attribution a:focus{text-decoration:underline}.leaflet-attribution-flag{display:inline !important;vertical-align:baseline !important;width:1em;height:0.6669em}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.4)}.leaflet-tooltip.leaflet-interactive{cursor:pointer;pointer-events:auto}.leaflet-tooltip-top:before,.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:\"\"}.leaflet-tooltip-bottom{margin-top:6px}.leaflet-tooltip-top{margin-top:-6px}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}.leaflet-tooltip-left{margin-left:-6px}.leaflet-tooltip-right{margin-left:6px}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}";

const ds = datasource.define({ roadBlocks: "roadBlocks", locations: "locations", routeChecks: "routeChecks" });

const roadBlockSelect = q.select({
  name: "SOSha",
  status: "D6wAy",
  directions: "4g06T",
  description: "XPGtI",
  source: "aamYX",
  polygon: "psx2W",
  snapshot: "QqgBQ",
});

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
  assessment: "Vr7bX",
  error: "kcNwI",
  checkedAt: "wrj14",
});

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
const POLL_MS = 2500;
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

function isActive(s: any) {
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

type MapProps = { blocks: any[]; locations: any[]; check: any | null; fromId: string; toId: string };

function RouteMap({ blocks, locations, check, fromId, toId }: MapProps) {
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
    layers.locations.clearLayers();
    layers.blocks.clearLayers();
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
        onEachFeature: (f: any, lyr: any) => lyr.bindTooltip(`${f.properties.name} · ${f.properties.status}`, { sticky: true }),
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

    // Only re-fit when what we are showing changes, so polling never resets the user's zoom/pan
    const fitKey = [
      blocks.map((b) => b.id).join(","),
      check ? `${check.id}:${selLabel(check.fields.status)}` : "none",
    ].join("|");
    if (fitKey !== fitKeyRef.current) {
      fitKeyRef.current = fitKey;
      const target = routeLayer ?? blockLayer;
      let bounds = target ? target.getBounds() : null;
      if (bounds && routeLayer && blockLayer) bounds = bounds.extend(blockLayer.getBounds());
      if (bounds && bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
      else map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [blocks, locations, check, fromId, toId]);

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

  const allBlocks = useMemo(() => (roadBlocksQ.data ? roadBlocksQ.data.pages.flatMap((p: any) => p.items) : []), [roadBlocksQ.data]);
  const active = useMemo(() => allBlocks.filter((r: any) => isActive(r.fields.status)), [allBlocks]);
  const locations = useMemo(() => {
    const items = locationsQ.data ? locationsQ.data.pages.flatMap((p: any) => p.items) : [];
    return [...items].sort((a: any, b: any) => String(a.fields.name ?? "").localeCompare(String(b.fields.name ?? "")));
  }, [locationsQ.data]);
  const checks = useMemo(() => (checksQ.data ? checksQ.data.pages.flatMap((p: any) => p.items) : []), [checksQ.data]);
  const locationsTotal = locationsQ.data?.pages?.[0]?.total ?? locations.length;
  const checksTotal = checksQ.data?.pages?.[0]?.total ?? checks.length;

  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingSince, setPendingSince] = useState(0);
  const [runError, setRunError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Sensible defaults once Locations load
  useEffect(() => {
    if (!locations.length) return;
    if (!fromId) {
      const f = locations.find((l: any) => l.fields.name === DEFAULT_FROM) ?? locations[0];
      setFromId(f.id);
    }
    if (!toId) {
      const t = locations.find((l: any) => l.fields.name === DEFAULT_TO) ?? locations[1] ?? locations[0];
      setToId(t.id);
    }
  }, [locations]);

  const pendingCheck = pendingId ? checks.find((c: any) => c.id === pendingId) ?? null : null;
  const isRunning = !!pendingId && (!pendingCheck || selLabel(pendingCheck.fields.status) === "Pending") && !timedOut;

  // Poll Route Checks while the workflow is working
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => {
      if (Date.now() - pendingSince > POLL_TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }
      checksQ.refetch();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [isRunning, pendingSince]);

  const shownCheck = pendingId ? pendingCheck : (checks[0] ?? null);
  const shownStatus = shownCheck ? selLabel(shownCheck.fields.status) : "";
  const complete = shownStatus === "Complete";
  const latestComplete = checks.find((c: any) => selLabel(c.fields.status) === "Complete") ?? null;

  const fromLoc = locations.find((l: any) => l.id === fromId);
  const toLoc = locations.find((l: any) => l.id === toId);
  const canRun = createCheck.enabled && !!fromLoc && !!toLoc && fromId !== toId && !isRunning && createCheck.status !== "pending";

  async function runCheck() {
    if (!canRun || !fromLoc || !toLoc) return;
    setRunError(null);
    setTimedOut(false);
    try {
      const rec: any = await createCheck.mutateAsync({
        label: `${fromLoc.fields.name} → ${toLoc.fields.name}`,
        status: "Pending",
        fromName: fromLoc.fields.name,
        fromLat: num(fromLoc.fields.lat),
        fromLon: num(fromLoc.fields.lon),
        toName: toLoc.fields.name,
        toLat: num(toLoc.fields.lat),
        toLon: num(toLoc.fields.lon),
      } as any);
      const id = rec?.id ?? rec?.record?.id ?? null;
      setPendingSince(Date.now());
      setPendingId(id);
      await checksQ.refetch();
    } catch (e: any) {
      setRunError(e?.message ?? "Could not start the route check.");
    }
  }

  const loadingBlocks = roadBlocksQ.status === "pending";
  const blocksError = roadBlocksQ.status === "error";
  const activeCount = loadingBlocks ? "…" : blocksError ? "!" : String(active.length);

  const latestSnapshot = useMemo(() => {
    let best: any = null;
    for (const r of allBlocks) {
      const t = r.fields.snapshot ? new Date(r.fields.snapshot).getTime() : NaN;
      if (!isNaN(t) && (!best || t > best.t)) best = { t, r };
    }
    return best?.r ?? null;
  }, [allBlocks]);
  const snapshotText = latestSnapshot ? `${sourceId(latestSnapshot.fields.source)} · ${fmtUtc(latestSnapshot.fields.snapshot)}` : loadingBlocks ? "Loading…" : "No snapshot";

  const kpis: [string, any, string, string][] = [
    ["Active Road Blocks", AlertTriangle, "text-red-700 bg-red-50", activeCount],
    ["Critical Locations", Building2, "text-slate-700 bg-slate-50", locationsQ.status === "pending" ? "…" : String(locationsTotal)],
    ["Latest Route Delay", Clock3, "text-blue-700 bg-blue-50", latestComplete ? `${fmtMin(latestComplete.fields.delayMin, true)} min` : "—"],
    ["Routes Checked", Route, "text-slate-700 bg-slate-50", checksQ.status === "pending" ? "…" : String(checksTotal)],
  ];

  let statusLine: any = <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Route className="h-4 w-4"/>Compares the normal route with a route that avoids every active road block (OpenRouteService, driving-car, free-flow times).</p>;
  if (!createCheck.enabled) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-amber-700"><AlertCircle className="h-4 w-4"/>You don't have permission to run route checks. Log in or ask the app owner for access.</p>;
  else if (fromId && fromId === toId) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-amber-700"><AlertCircle className="h-4 w-4"/>Choose two different locations.</p>;
  if (isRunning || createCheck.status === "pending") statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-blue-700"><Loader2 className="h-4 w-4 animate-spin"/>Calculating normal and safe routes…</p>;
  else if (runError) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-red-700"><AlertCircle className="h-4 w-4"/>{runError}</p>;
  else if (timedOut) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-red-700"><AlertCircle className="h-4 w-4"/>No result after 2 minutes. Check that the "Check route impact" workflow is published.</p>;
  else if (pendingId && shownStatus === "Error") statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-red-700"><AlertCircle className="h-4 w-4"/>Route check failed: {shownCheck?.fields.error || "unknown error"}</p>;
  else if (pendingId && complete) statusLine = <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Route check complete.</p>;

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
          <button onClick={runCheck} disabled={!canRun} className="flex h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50">
            {isRunning || createCheck.status === "pending" ? <><Loader2 className="h-4 w-4 animate-spin"/>CHECKING</> : "CHECK ROUTE"}
          </button>
        </div>
        {statusLine}
      </section>

      <section className="grid grid-cols-4 gap-3">
        {kpis.map(([label, Icon, style, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><span className={"rounded-md p-2 " + style}><Icon className="h-4 w-4"/></span></div><p className="mt-2 text-3xl font-bold">{value}</p></div>)}
      </section>

      <section className="grid grid-cols-[320px_minmax(0,1fr)] gap-4">
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3"><h3 className="font-bold">Active disruptions</h3><p className="text-xs text-slate-500">From Road Blocks · status Active</p></div>
            {loadingBlocks && <div className="p-4 text-xs text-slate-500">Loading road blocks…</div>}
            {blocksError && <div className="p-4 text-xs text-red-700">Could not load Road Blocks.</div>}
            {!loadingBlocks && !blocksError && active.length === 0 && <div className="p-4 text-xs text-slate-500">No active road blocks.</div>}
            {active.map((b: any) => {
              const f = b.fields;
              const hasPoly = !!parsePolygon(f.polygon);
              return <div key={b.id} className="border-b border-slate-100 p-4 last:border-b-0">
                <div className="flex items-start justify-between gap-2"><div><p className="font-bold">{f.name}</p>{f.directions && <p className="mt-1 text-xs text-slate-500">{f.directions}</p>}</div><span className="shrink-0 rounded bg-red-100 px-2 py-1 text-[11px] font-bold uppercase text-red-700">{selLabel(f.status)}</span></div>
                {f.description && <p className="mt-4 text-xs leading-5 text-slate-600">{f.description}</p>}
                {f.source && <p className="mt-3 text-[11px] text-slate-400">{f.source}</p>}
                {!hasPoly && <p className="mt-2 text-[11px] text-amber-700">No valid avoid polygon — not drawn on map.</p>}
              </div>;
            })}
          </div>
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
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><div><h3 className="font-bold">Route and disruption map</h3><p className="text-xs text-slate-500">Chelsea and Battersea</p></div><div className="flex gap-4 text-xs"><span className="text-slate-500">-- Normal</span><span className="text-blue-700">━ Disruption</span><span className="text-red-700">■ Blocked</span></div></div>
          <div className="relative isolate z-0 h-[500px] overflow-hidden bg-slate-200">
            <RouteMap blocks={active} locations={locations} check={complete ? shownCheck : null} fromId={fromId} toId={toId}/>
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
          : shownCheck && shownCheck.fields.assessment
            ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{shownCheck.fields.assessment}</p>
            : <p className="mt-2 text-sm text-slate-500">Run CHECK ROUTE to generate an AI assessment of the latest route check.</p>}
        {shownCheck && shownCheck.fields.assessment && !isRunning && <p className="mt-3 text-[11px] text-slate-400">AI-generated from the route figures above. Demonstration only; verify before operational use.</p>}
      </section>
    </main>
  </div>
}
