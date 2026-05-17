import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BarajitasGrid from "@/components/BarajitasGrid";

export const dynamic = "force-dynamic";

export default async function MiColeccion() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/mi-coleccion");

  const { data: album } = await supabase
    .from("albumes")
    .select("*")
    .eq("activo", true)
    .maybeSingle();

  if (!album) {
    return (
      <div className="py-4">
        <div className="rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-900">
          Aún no hay un álbum activo.
        </div>
      </div>
    );
  }

  const { data: barajitas } = await supabase
    .from("barajitas")
    .select("*")
    .eq("album_id", album.id)
    .order("orden", { ascending: true });

  const { data: coleccionRows } = await supabase
    .from("coleccion")
    .select("barajita_id, cantidad")
    .eq("user_id", user.id);

  const coleccion = Object.fromEntries((coleccionRows ?? []).map((c) => [c.barajita_id, c.cantidad]));

  return (
    <div className="space-y-6 py-4">
      <div>
        <p>Estamos trabajando en la corrección de los nombres de jugadores pero puedes utilizar los codigos de barajitas.</p>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Mi colección</h1>
          <p className="text-gray-600">Álbum: <strong>{album.nombre}</strong></p>
          <p className="mt-1 text-xs text-gray-500">
            Pulsa <strong>+</strong> para sumar lo que tienes. Si superas 1, son repetidas para intercambiar.
          </p>
        </div>
        <Link
          href="/comparar"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Buscar intercambios
        </Link>
      </header>

      <BarajitasGrid
        barajitas={barajitas ?? []}
        coleccionInicial={coleccion}
        isAuthed
      />
    </div>
  );
}
