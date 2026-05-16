import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeftRight, MessageCircle, Mail, MapPin, UserCircle2 } from "lucide-react";

export default async function CompararConUsuario({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (user.id === params.userId) {
    redirect("/comparar");
  }

  const { data: album } = await supabase
    .from("albumes")
    .select("id, nombre")
    .eq("activo", true)
    .maybeSingle();

  if (!album) {
    return <p className="py-4 text-gray-600">No hay álbum activo.</p>;
  }

  // Perfil del otro usuario (incluyendo email desde auth.users vía función RPC si es posible)
  const { data: otroPerfil } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, ciudad, whatsapp")
    .eq("id", params.userId)
    .maybeSingle();

  // Perfil propio para saber si tiene WhatsApp configurado
  const { data: miPerfil } = await supabase
    .from("profiles")
    .select("whatsapp")
    .eq("id", user.id)
    .maybeSingle();

  if (!otroPerfil) notFound();

  // Barajitas del álbum activo
  const { data: barajitas } = await supabase
    .from("barajitas")
    .select("id, numero, nombre, equipo, rareza")
    .eq("album_id", album.id)
    .order("orden", { ascending: true });

  // Colección de ambos usuarios
  const [{ data: miCol }, { data: otroCol }] = await Promise.all([
    supabase.from("coleccion").select("barajita_id, cantidad").eq("user_id", user.id),
    supabase.from("coleccion").select("barajita_id, cantidad").eq("user_id", params.userId)
  ]);

  const mio = new Map((miCol ?? []).map((c) => [c.barajita_id, c.cantidad]));
  const suyo = new Map((otroCol ?? []).map((c) => [c.barajita_id, c.cantidad]));

  // Yo le doy: yo tengo repetidas (>=2) y él no la tiene (0 o falta)
  const yoLeDoy = (barajitas ?? []).filter((b) => {
    const m = mio.get(b.id) ?? 0;
    const s = suyo.get(b.id) ?? 0;
    return m >= 2 && s < 1;
  });

  // Él me da: él tiene repetidas (>=2) y yo no la tengo
  const elMeDa = (barajitas ?? []).filter((b) => {
    const m = mio.get(b.id) ?? 0;
    const s = suyo.get(b.id) ?? 0;
    return s >= 2 && m < 1;
  });

  const matches = Math.min(yoLeDoy.length, elMeDa.length);

  return (
    <div className="space-y-6 py-4">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        {/* Datos del usuario */}
        <div className="flex flex-wrap items-center gap-4">
          {otroPerfil.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otroPerfil.avatar_url} alt="" className="h-16 w-16 rounded-full" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
              <UserCircle2 className="h-10 w-10" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold sm:text-2xl">
              {otroPerfil.display_name ?? "Coleccionista"}
            </h1>
            {otroPerfil.ciudad && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" /> {otroPerfil.ciudad}
              </p>
            )}
            <p className="mt-0.5 text-xs text-gray-400">Álbum: {album.nombre}</p>
          </div>
        </div>

        {/* Botones de contacto */}
        <div className="mt-5 space-y-3">
          {otroPerfil.whatsapp ? (
            <a
              href={`https://wa.me/${otroPerfil.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                `¡Hola! Vi tu colección en IntercambioBarajitas y me interesa hacer un intercambio del álbum ${album.nombre}. ¿Coordinamos?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar por WhatsApp
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              <MessageCircle className="h-5 w-5 text-gray-400" />
              Este usuario aún no ha registrado su WhatsApp.
            </div>
          )}

{/*           <a
            href={`mailto:?subject=${encodeURIComponent(`Intercambio de barajitas - ${album.nombre}`)}&body=${encodeURIComponent(
              `Hola,\n\nVi tu colección en IntercambioBarajitas y me interesa hacer un intercambio del álbum "${album.nombre}".\n\n¿Podemos coordinar?\n\nSaludos.`
            )}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Mail className="h-4 w-4" />
            Enviar email
          </a> */}
        </div>

        {/* Tu propio WhatsApp no configurado */}
        {!miPerfil?.whatsapp && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ <strong>Tu WhatsApp no está configurado.</strong>{" "}
            <Link href="/perfil" className="font-semibold underline hover:text-amber-900">
              Agrégalo en tu perfil
            </Link>{" "}
            para que ellos también puedan contactarte.
          </div>
        )}

        {/* Resumen de intercambios */}
        <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
          <p className="font-semibold">
            <ArrowLeftRight className="mr-1 inline h-4 w-4" />
            {matches > 0
              ? `¡Pueden hacer hasta ${matches} intercambios directos!`
              : "No hay intercambios directos posibles, pero pueden seguir negociando."}
          </p>
          {matches > 0 && (
            <p className="mt-1 text-xs text-brand-700">
              Tú le das {yoLeDoy.length} barajita{yoLeDoy.length !== 1 ? "s" : ""} y recibes {elMeDa.length}.
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yo le doy */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">🟢 Tú le das</h2>
          <p className="mb-4 text-sm text-gray-600">
            Tus repetidas que <strong>{otroPerfil.display_name ?? "el usuario"}</strong> necesita ({yoLeDoy.length})
          </p>
          <ListaBarajitas barajitas={yoLeDoy} variant="give" />
        </section>

        {/* Él me da */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">🔵 Tú recibes</h2>
          <p className="mb-4 text-sm text-gray-600">
            Sus repetidas que tú necesitas ({elMeDa.length})
          </p>
          <ListaBarajitas barajitas={elMeDa} variant="receive" />
        </section>
      </div>
    </div>
  );
}

function ListaBarajitas({
  barajitas,
  variant
}: {
  barajitas: Array<{ id: string; numero: string; nombre: string | null; equipo: string | null; rareza: string | null }>;
  variant: "give" | "receive";
}) {
  if (barajitas.length === 0) {
    return <p className="text-sm text-gray-500">Nada por ahora.</p>;
  }
  const color = variant === "give" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200";
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {barajitas.map((b) => (
        <li key={b.id} className={`rounded-lg border p-2 text-sm ${color}`}>
          <p className="text-xs font-semibold uppercase text-gray-600">
            #{b.numero}
            {b.rareza === "legendaria" && " ⭐"}
            {b.rareza === "rara" && " ✨"}
          </p>
          <p className="line-clamp-2 font-medium text-gray-900">{b.nombre ?? `Barajita ${b.numero}`}</p>
          {b.equipo && <p className="text-xs text-gray-500">{b.equipo}</p>}
        </li>
      ))}
    </ul>
  );
}
