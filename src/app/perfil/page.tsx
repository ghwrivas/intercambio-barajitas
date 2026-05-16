"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PerfilForm from "./PerfilForm";

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/perfil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, ciudad, whatsapp, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Mi perfil
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Completa tus datos de contacto para que otros usuarios puedan
          comunicarse contigo y coordinar intercambios.
        </p>
      </header>

      <PerfilForm
        userId={user.id}
        email={user.email ?? ""}
        initialData={{
          display_name: profile?.display_name ?? "",
          ciudad: profile?.ciudad ?? "",
          whatsapp: profile?.whatsapp ?? "",
        }}
      />
    </div>
  );
}
