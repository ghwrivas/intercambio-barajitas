import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BarajitasGrid from "@/components/BarajitasGrid";

export default async function AlbumDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: album } = await supabase
    .from("albumes")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!album) notFound();

  const { data: barajitas } = await supabase
    .from("barajitas")
    .select("*")
    .eq("album_id", album.id)
    .order("numero");

  let coleccion: Record<string, number> = {};
  if (user) {
    const { data } = await supabase
      .from("coleccion")
      .select("barajita_id, cantidad")
      .eq("user_id", user.id);
    coleccion = Object.fromEntries((data ?? []).map((c) => [c.barajita_id, c.cantidad]));
  }

  return (
    <div className="space-y-6 py-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{album.nombre}</h1>
          {album.descripcion && <p className="text-gray-600">{album.descripcion}</p>}
          <p className="mt-1 text-sm text-gray-500">{barajitas?.length ?? 0} barajitas</p>
        </div>
        {album.activo && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Álbum activo
          </span>
        )}
      </header>

      {!user && (
        <div className="rounded-lg border bg-yellow-50 p-4 text-sm text-yellow-900">
          Inicia sesión para marcar las barajitas que tienes o buscas.
        </div>
      )}

      <BarajitasGrid
        barajitas={barajitas ?? []}
        coleccionInicial={coleccion}
        isAuthed={!!user}
      />
    </div>
  );
}
