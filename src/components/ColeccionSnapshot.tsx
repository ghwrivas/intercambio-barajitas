"use client";
import { forwardRef } from "react";
import type { Barajita } from "@/lib/types";
import { getCountryIso } from "@/lib/flags";

function isoToEmoji(iso2: string): string {
  const code = iso2.includes("-") ? iso2.split("-")[0] : iso2;
  const [a, b] = code.toUpperCase().split("");
  if (!a || !b) return "";
  return (
    String.fromCodePoint(0x1f1e6 + a.charCodeAt(0) - 65) +
    String.fromCodePoint(0x1f1e6 + b.charCodeAt(0) - 65)
  );
}

type Props = {
  barajitas: Barajita[];
  coleccion: Record<string, number>;
  albumNombre: string;
};

export const ColeccionSnapshot = forwardRef<HTMLDivElement, Props>(
  ({ barajitas, coleccion, albumNombre }, ref) => {
    const ordered: string[] = [];
    const groups = new Map<string, Barajita[]>();
    for (const b of barajitas) {
      const key = b.equipo ?? "Especiales";
      if (!groups.has(key)) {
        groups.set(key, []);
        ordered.push(key);
      }
      groups.get(key)!.push(b);
    }

    let tengo = 0, faltan = 0, repetidas = 0;
    for (const b of barajitas) {
      const c = coleccion[b.id] ?? 0;
      if (c >= 1) tengo++;
      else faltan++;
      if (c >= 2) repetidas++;
    }

    const today = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          background: "#ffffff",
          padding: "20px 20px 16px",
          width: "860px",
          minWidth: "860px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "12px",
            paddingBottom: "10px",
            borderBottom: "3px solid #ec7220",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            Mi Colección · {albumNombre}
          </h1>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>{today}</span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Tengo", value: tengo, bg: "#dcfce7", color: "#166534" },
            { label: "Para cambiar", value: repetidas, bg: "#dbeafe", color: "#1e40af" },
            { label: "Faltan", value: faltan, bg: "#fee2e2", color: "#991b1b" },
            { label: "Total", value: barajitas.length, bg: "#f3f4f6", color: "#374151" },
          ].map((s) => (
            <span
              key={s.label}
              style={{
                background: s.bg,
                color: s.color,
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {s.label}: {s.value}
            </span>
          ))}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "10px",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600 }}
          >
            Leyenda:
          </span>
          {[
            { bg: "#22c55e", color: "white", text: "Tengo (1)" },
            { bg: "#3b82f6", color: "white", text: "Repetida (×N)" },
            { bg: "#e5e7eb", color: "#9ca3af", text: "Falta" },
          ].map((l) => (
            <span
              key={l.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                color: "#6b7280",
              }}
            >
              <span
                style={{
                  background: l.bg,
                  color: l.color,
                  borderRadius: "3px",
                  padding: "1px 6px",
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                ab
              </span>
              {l.text}
            </span>
          ))}
        </div>

        {/* Per-team rows */}
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}
        >
          <tbody>
            {ordered.map((equipo) => {
              const stickers = groups.get(equipo)!;
              const iso =
                equipo !== "Especiales" ? getCountryIso(equipo) : null;
              const emoji = iso ? isoToEmoji(iso) : "";

              const rowTengo = stickers.filter(
                (b) => (coleccion[b.id] ?? 0) === 1
              ).length;
              const rowRep = stickers.filter(
                (b) => (coleccion[b.id] ?? 0) >= 2
              ).length;
              const rowFaltan = stickers.filter(
                (b) => (coleccion[b.id] ?? 0) === 0
              ).length;

              return (
                <tr
                  key={equipo}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    verticalAlign: "top",
                  }}
                >
                  {/* Team column */}
                  <td
                    style={{
                      padding: "5px 8px 5px 2px",
                      width: "150px",
                      minWidth: "150px",
                      paddingTop: "7px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      {emoji && (
                        <span style={{ fontSize: "15px", lineHeight: 1, flexShrink: 0 }}>
                          {emoji}
                        </span>
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "11px",
                            lineHeight: 1.3,
                          }}
                        >
                          {equipo}
                        </div>
                        <div
                          style={{ fontSize: "9px", lineHeight: 1.4 }}
                        >
                          {rowTengo > 0 && (
                            <span style={{ color: "#16a34a" }}>
                              {rowTengo}✓{" "}
                            </span>
                          )}
                          {rowRep > 0 && (
                            <span style={{ color: "#2563eb" }}>
                              {rowRep}↑{" "}
                            </span>
                          )}
                          {rowFaltan > 0 && (
                            <span style={{ color: "#9ca3af" }}>
                              {rowFaltan}✗
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Sticker chips */}
                  <td style={{ padding: "4px 0" }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "2px",
                        alignItems: "center",
                      }}
                    >
                      {stickers.map((b) => {
                        const c = coleccion[b.id] ?? 0;
                        const bg =
                          c >= 2 ? "#3b82f6" : c === 1 ? "#22c55e" : "#e5e7eb";
                        const color = c >= 1 ? "#ffffff" : "#9ca3af";
                        const label = c >= 2 ? `${b.numero}×${c}` : b.numero;
                        const isRare =
                          b.rareza === "legendaria" || b.rareza === "rara";
                        return (
                          <span
                            key={b.id}
                            style={{
                              background: bg,
                              color,
                              borderRadius: "3px",
                              padding: "2px 4px",
                              fontSize: "10px",
                              fontWeight: isRare ? 700 : 500,
                              lineHeight: 1.2,
                              outline: isRare ? "1px solid #f59e0b" : "none",
                            }}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div
          style={{
            marginTop: "14px",
            fontSize: "9px",
            color: "#d1d5db",
            textAlign: "center",
            borderTop: "1px solid #f3f4f6",
            paddingTop: "8px",
          }}
        >
          Generado con IntercambioBarajitas
        </div>
      </div>
    );
  }
);

ColeccionSnapshot.displayName = "ColeccionSnapshot";
