"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: { full_name: displayName }
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  }

  async function handleOAuth(provider: "google" | "facebook") {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${siteUrl}/auth/callback` }
    });
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
        ¡Cuenta creada! Puedes iniciar sesión ahora.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Continuar con Google
        </button>
{/*         <button
          onClick={() => handleOAuth("facebook")}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0c63d4]"
        >
          Continuar con Facebook
        </button> */}
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">o con tu email</span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
