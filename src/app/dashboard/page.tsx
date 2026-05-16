import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Layers, Users, ArrowRight, AlertCircle } from "lucide-react";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, ciudad, whatsapp")
    .eq("id", user.id)
    .maybeSingle();

  const perfilIncompleto = !profile?.whatsapp;

  const { data: album } = await supabase
    .from("albumes")
    .select("*")
    .eq("activo", true)
    .maybeSingle();

  let tiene = 0;
  let busca = 0;
  let repetidas = 0;
  if (album) {
    const { data: resumen } = await supabase
      .from("coleccion_resumen")
      .select("tiene, busca, repetidas")
      .eq("user_id", user.id)
      .eq("album_id", album.id)
      .maybeSingle();
    tiene = resumen?.tiene ?? 0;
    busca = resumen?.busca ?? 0;
    repetidas = resumen?.repetidas ?? 0;
  }

  const faltan = album ? album.total_barajitas - tiene : 0;
  const progreso = album && album.total_barajitas > 0
    ? Math.round((tiene / album.total_barajitas) * 100)
    : 0;

  return (
    <div className="space-y-8 py-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          ¡Hola{profile?.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-gray-600">Aquí está el resumen de tu colección.</p>
      </header>

      {perfilIncompleto && (
        <Link
          href="/perfil"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 hover:bg-amber-100"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">Completa tu perfil para intercambiar</p>
            <p className="mt-0.5 text-amber-700">
              Agrega tu WhatsApp y ciudad para que otros coleccionistas puedan contactarte. →
            </p>
          </div>
        </Link>
      )}

      {!album ? (
        <div className="rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-900">
          Aún no hay un álbum activo. El admin debe activar uno.
        </div>
      ) : (
        <>
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Álbum activo</p>
                <h2 className="text-xl font-bold">{album.nombre}</h2>
                {album.descripcion && <p className="mt-1 text-sm text-gray-600">{album.descripcion}</p>}
              </div>
              <Link
                href={`/albumes/${album.id}`}
                className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Gestionar mis barajitas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>Progreso</span>
                <span>{progreso}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-brand-500"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Tengo" value={tiene} color="text-green-600" />
            <Stat label="Me faltan" value={faltan} color="text-red-600" />
            <Stat label="Repetidas" value={repetidas} color="text-blue-600" />
            <Stat label="Total álbum" value={album.total_barajitas} color="text-gray-700" />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/mi-coleccion"
              className="group rounded-2xl border bg-white p-6 shadow-sm hover:border-brand-300 hover:shadow"
            >
              <Layers className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 font-semibold">Mi colección</h3>
              <p className="mt-1 text-sm text-gray-600">
                Marca lo que tienes y las repetidas que puedes intercambiar.
              </p>
            </Link>
            <Link
              href="/comparar"
              className="group rounded-2xl border bg-white p-6 shadow-sm hover:border-brand-300 hover:shadow"
            >
              <Users className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 font-semibold">Comparar con otros</h3>
              <p className="mt-1 text-sm text-gray-600">
                Mira en un vistazo qué intercambios puedes hacer.
              </p>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  );
}
