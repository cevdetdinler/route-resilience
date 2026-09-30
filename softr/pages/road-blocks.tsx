
import { useState } from "react";
import { AlertTriangle, Filter, Search, ShieldAlert } from "lucide-react";

const nav = [{label:"Live Impact",href:"/"},{label:"Route Checks",href:"/route-checks"},{label:"Road Blocks",href:"/road-blocks"}];

export default function Block() {
  const [query,setQuery]=useState("");
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4"><div className="flex items-center gap-3"><ShieldAlert className="h-7 w-7 text-blue-700"/><div><h1 className="text-xl font-bold">RouteResilience</h1><p className="text-xs text-slate-500">Chelsea / Battersea</p></div></div><nav className="flex gap-1 rounded-lg bg-slate-100 p-1">{nav.map(x=><a key={x.label} href={x.href} className={x.href==="/road-blocks"?"rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm":"rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"}>{x.label}</a>)}</nav></div></header>
      <main className="mx-auto max-w-[1440px] space-y-4 px-6 py-5">
        <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Disruption management</p><h2 className="text-2xl font-bold">Road Blocks</h2></div><div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">DEMONSTRATION SCENARIO</div></div>
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-[minmax(260px,1fr)_180px_180px_180px] gap-3">
            <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search disruptions" className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm"/></label>
            {["Status","Severity","Cause"].map(x=><select key={x} disabled className="h-10 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-500"><option>{x}: All</option></select>)}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><div><h3 className="font-bold">All road blocks</h3><p className="text-xs text-slate-500">Change Status directly for rapid scenario escalation</p></div><span className="flex items-center gap-2 text-xs text-slate-500"><Filter className="h-4 w-4"/>0 records</span></div>
          <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1.4fr] gap-4 border-b bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">{["Title","Cause","Severity","Status","Radius","Reported at"].map(x=><span key={x}>{x}</span>)}</div>
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-100 p-4"><AlertTriangle className="h-6 w-6 text-slate-400"/></div>
            <p className="mt-4 text-sm font-semibold">Road Blocks table is not connected</p>
            <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">Once the existing table is available, records and one-click Active/Cleared status controls will appear here.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
