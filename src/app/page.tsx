import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Users, Layers, Shuffle } from "lucide-react";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: albumActivo } = await supabase
    .from("albumes")
    .select("nombre, total_barajitas")
    .eq("activo", true)
    .maybeSingle();

  return (
    <div className="space-y-12 py-6">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Completa tu álbum, intercambia con otros.
          </h1>
          <p className="mt-4 text-lg text-brand-50">
            Registra las barajitas que tienes y las que te faltan. Encuentra usuarios
            con quienes intercambiar y completa tu colección más rápido.
          </p>
          {albumActivo && (
            <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm">
              Álbum activo: <strong>{albumActivo.nombre}</strong> · {albumActivo.total_barajitas} barajitas
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                Ir a mi cuenta <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  Crear cuenta gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-6 sm:grid-cols-3">
        <Feature
          icon={<Layers className="h-6 w-6" />}
          title="Registra tu colección"
          text="Marca cuántas tienes de cada barajita. El sistema sabe cuáles te faltan automáticamente."
        />
        <Feature
          icon={<Users className="h-6 w-6" />}
          title="Encuentra usuarios"
          text="Busca otros coleccionistas y mira en un vistazo qué les puedes intercambiar."
        />
        <Feature
          icon={<Shuffle className="h-6 w-6" />}
          title="Intercambia"
          text="Coordina por WhatsApp o email para completar tu álbum más rápido."
        />
      </section>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}
