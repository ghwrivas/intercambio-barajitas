import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";

export default async function AlbumesPage() {
  const supabase = createClient();
  const { data: albumes } = await supabase
    .from("albumes")
    .select("*")
    .order("activo", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Álbumes</h1>
        <p className="text-gray-600">El álbum activo es el evento actual. Los demás quedan como historial.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(albumes ?? []).map((a) => (
          <Link
            key={a.id}
            href={`/albumes/${a.id}`}
            className="group rounded-2xl border bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">{a.nombre}</h2>
              {a.activo && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Activo
                </span>
              )}
            </div>
            {a.descripcion && <p className="mt-2 text-sm text-gray-600">{a.descripcion}</p>}
            <p className="mt-3 text-sm text-gray-500">{a.total_barajitas} barajitas</p>
            <div className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600">
              Ver álbum <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
        {(!albumes || albumes.length === 0) && (
          <p className="text-sm text-gray-500">Aún no hay álbumes cargados.</p>
        )}
      </div>
    </div>
  );
}
