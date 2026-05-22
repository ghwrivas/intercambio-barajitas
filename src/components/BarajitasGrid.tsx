"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Barajita } from "@/lib/types";
import { Camera, Download, Minus, Plus, Search, X } from "lucide-react";
import { getCountryIso, getCountryFifa } from "@/lib/flags";
import { ColeccionSnapshot } from "@/components/ColeccionSnapshot";

type Props = {
  barajitas: Barajita[];
  coleccionInicial: Record<string, number>;
  isAuthed: boolean;
  albumNombre?: string;
};

type Filtro = "todas" | "tengo" | "faltan" | "repetidas";
type CampoBusqueda = "numero" | "nombre" | "equipo";

export default function BarajitasGrid({ barajitas, coleccionInicial, isAuthed, albumNombre }: Props) {
  const [coleccion, setColeccion] = useState<Record<string, number>>(coleccionInicial);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [camposBusqueda, setCamposBusqueda] = useState<Set<CampoBusqueda>>(
    new Set(["numero", "nombre", "equipo"])
  );
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  function toggleCampo(campo: CampoBusqueda) {
    setCamposBusqueda((prev) => {
      const next = new Set(prev);
      if (next.has(campo) && next.size > 1) next.delete(campo);
      else next.add(campo);
      return next;
    });
  }
  const supabase = useMemo(() => createClient(), []);

  const filtradas = useMemo(() => {
    return barajitas.filter((b) => {
      const c = coleccion[b.id] ?? 0;
      if (filtro === "tengo" && c < 1) return false;
      if (filtro === "faltan" && c >= 1) return false;
      if (filtro === "repetidas" && c < 2) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const partes: (string | null | undefined)[] = [];
        if (camposBusqueda.has("numero")) partes.push(b.numero);
        if (camposBusqueda.has("nombre")) partes.push(b.nombre);
        if (camposBusqueda.has("equipo")) {
          partes.push(b.equipo);
          if (b.equipo) partes.push(getCountryFifa(b.equipo));
        }
        const hay = partes.filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [barajitas, coleccion, filtro, busqueda, camposBusqueda]);

  async function actualizar(barajitaId: string, nuevaCantidad: number) {
    if (!isAuthed) {
      alert("Inicia sesión para gestionar tu colección.");
      return;
    }
    const cantidad = Math.max(0, nuevaCantidad);

    // Optimistic update
    setColeccion((prev) => ({ ...prev, [barajitaId]: cantidad }));

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (cantidad === 0) {
        await supabase
          .from("coleccion")
          .delete()
          .eq("user_id", user.id)
          .eq("barajita_id", barajitaId);
      } else {
        await supabase
          .from("coleccion")
          .upsert(
            { user_id: user.id, barajita_id: barajitaId, cantidad, updated_at: new Date().toISOString() },
            { onConflict: "user_id,barajita_id" }
          );
      }
    });
  }

  async function handleDownload() {
    if (!snapshotRef.current) return;
    setIsDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(snapshotRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `coleccion-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } finally {
      setIsDownloading(false);
    }
  }

  const counts = useMemo(() => {
    let tengo = 0, faltan = 0, repetidas = 0;
    for (const b of barajitas) {
      const c = coleccion[b.id] ?? 0;
      if (c >= 1) tengo++;
      else faltan++;
      if (c >= 2) repetidas++;
    }
    return { tengo, faltan, repetidas };
  }, [barajitas, coleccion]);

  return (
    <div className="space-y-4">
      {/* Filtros + botón compartir */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filtro === "todas"}    onClick={() => setFiltro("todas")}    label={`Todas (${barajitas.length})`} />
        <FilterChip active={filtro === "tengo"}    onClick={() => setFiltro("tengo")}    label={`Tengo (${counts.tengo})`} />
        <FilterChip active={filtro === "faltan"}   onClick={() => setFiltro("faltan")}   label={`Faltan (${counts.faltan})`} />
        <FilterChip active={filtro === "repetidas"} onClick={() => setFiltro("repetidas")} label={`Repetidas (${counts.repetidas})`} />
        <button
          onClick={() => setShowSnapshot(true)}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-brand-300 bg-white px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition"
        >
          <Camera className="h-4 w-4" />
          Compartir
        </button>
      </div>

      {/* Buscador */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={`Buscar por ${[
              camposBusqueda.has("numero") && "número",
              camposBusqueda.has("nombre") && "nombre",
              camposBusqueda.has("equipo") && "equipo",
            ].filter(Boolean).join(", ")}...`}
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          <span className="self-center text-xs text-gray-400">Buscar en:</span>
          {(["numero", "nombre", "equipo"] as CampoBusqueda[]).map((campo) => (
            <button
              key={campo}
              onClick={() => toggleCampo(campo)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition border ${
                camposBusqueda.has(campo)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-500 border-gray-300 hover:border-brand-300"
              }`}
            >
              {campo === "numero" ? "#Número" : campo === "nombre" ? "Nombre" : "Equipo"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtradas.map((b) => {
          const c = coleccion[b.id] ?? 0;
          const estado =
            c === 0 ? "border-gray-200 bg-gray-50" :
            c === 1 ? "border-green-300 bg-green-50" :
            "border-blue-300 bg-blue-50";
          return (
            <div key={b.id} className={`rounded-xl border-2 p-3 ${estado}`}>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase text-gray-500">#{b.numero}</span>
                {b.rareza === "legendaria" && <span className="text-xs">⭐</span>}
                {b.rareza === "rara" && <span className="text-xs">✨</span>}
              </div>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-900">{b.nombre ?? `Barajita ${b.numero}`}</p>
              {b.equipo && (
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  {getCountryIso(b.equipo) && (
                    <span
                      className={`fi fi-${getCountryIso(b.equipo)} rounded-sm`}
                      aria-hidden="true"
                    />
                  )}
                  {b.equipo}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => actualizar(b.id, c - 1)}
                  disabled={!isAuthed || c <= 0}
                  className="rounded-full bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Restar"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-bold">{c}</span>
                <button
                  onClick={() => actualizar(b.id, c + 1)}
                  disabled={!isAuthed}
                  className="rounded-full bg-brand-600 p-1.5 text-white shadow-sm hover:bg-brand-700 disabled:opacity-40"
                  aria-label="Sumar"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filtradas.length === 0 && (
          <p className="col-span-full text-center text-sm text-gray-500">No hay barajitas con esos filtros.</p>
        )}
      </div>

      {/* Snapshot modal */}
      {showSnapshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSnapshot(false); }}
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Camera className="h-5 w-5 text-brand-600" />
              <span className="flex-1 font-semibold text-gray-800">Vista para compartir</span>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 transition"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? "Generando…" : "Descargar PNG"}
              </button>
              <button
                onClick={() => setShowSnapshot(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Scrollable preview */}
            <div className="overflow-auto flex-1 bg-gray-50 p-4">
              <div className="inline-block min-w-full">
                <ColeccionSnapshot
                  ref={snapshotRef}
                  barajitas={barajitas}
                  coleccion={coleccion}
                  albumNombre={albumNombre ?? "Mi colección"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active ? "bg-brand-600 text-white" : "bg-white text-gray-700 border hover:border-brand-300"
      }`}
    >
      {label}
    </button>
  );
}
