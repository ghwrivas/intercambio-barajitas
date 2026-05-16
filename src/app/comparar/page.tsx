import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";

export default async function CompararPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/comparar");

  const { data: album } = await supabase
    .from("albumes")
    .select("id, nombre")
    .eq("activo", true)
    .maybeSingle();

  // Usuarios con alguna actividad en el álbum activo
  let usuarios: Array<{
    user_id: string;
    tiene: number;
    busca: number;
    repetidas: number;
    profile: { display_name: string | null; avatar_url: string | null; ciudad: string | null } | null;
  }> = [];

  if (album) {
    const { data } = await supabase
      .from("coleccion_resumen")
      .select("user_id, tiene, busca, repetidas")
      .eq("album_id", album.id)
      .neq("user_id", user.id);

    const ids = (data ?? []).map((d) => d.user_id);
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, ciudad")
        .in("id", ids);
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      usuarios = (data ?? []).map((d) => ({
        ...d,
        profile: map.get(d.user_id) ?? null
      }));
    }
  }

  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Comparar con otros usuarios</h1>
        <p className="text-gray-600">
          {album
            ? <>Otros coleccionistas del álbum <strong>{album.nombre}</strong>:</>
            : "No hay álbum activo todavía."}
        </p>
      </header>

      {usuarios.length === 0 ? (
        <p className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
          Todavía no hay otros usuarios con barajitas registradas. ¡Invita a tus amigos!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((u) => (
            <Link
              key={u.user_id}
              href={`/comparar/${u.user_id}`}
              className="group rounded-2xl border bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow"
            >
              <div className="flex items-center gap-3">
                {u.profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.profile.avatar_url} alt="" className="h-12 w-12 rounded-full" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold">
                    {(u.profile?.display_name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{u.profile?.display_name ?? "Usuario"}</p>
                  {u.profile?.ciudad && <p className="text-xs text-gray-500">{u.profile.ciudad}</p>}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-base font-bold text-green-600">{u.tiene}</p>
                  <p className="text-gray-500">tiene</p>
                </div>
                <div>
                  <p className="text-base font-bold text-blue-600">{u.repetidas}</p>
                  <p className="text-gray-500">repe</p>
                </div>
                <div>
                  <p className="text-base font-bold text-red-600">{u.busca}</p>
                  <p className="text-gray-500">busca</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600">
                Ver intercambios <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
