"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, MapPin, MessageCircle, Mail, CheckCircle2 } from "lucide-react";

type Props = {
  userId: string;
  email: string;
  initialData: {
    display_name: string;
    ciudad: string;
    whatsapp: string;
  };
};

export default function PerfilForm({ userId, email, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name.trim() || null,
        ciudad: form.ciudad.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setLoading(false);
    if (err) {
      setError("No se pudo guardar. Intenta de nuevo.");
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  const whatsappPreview = form.whatsapp.trim().replace(/\D/g, "");

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
    >
      {/* Email (solo lectura) */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
          <Mail className="h-4 w-4" /> Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">
          El email no se puede cambiar desde aquí.
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label
          htmlFor="display_name"
          className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700"
        >
          <User className="h-4 w-4" /> Nombre o apodo
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          value={form.display_name}
          onChange={handleChange}
          placeholder="Ej: Carlos Pérez"
          maxLength={60}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <p className="mt-1 text-xs text-gray-400">
          Así te verán los otros coleccionistas.
        </p>
      </div>

      {/* Ciudad */}
      <div>
        <label
          htmlFor="ciudad"
          className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700"
        >
          <MapPin className="h-4 w-4" /> Ciudad
        </label>
        <input
          id="ciudad"
          name="ciudad"
          type="text"
          value={form.ciudad}
          onChange={handleChange}
          placeholder="Ej: Bogotá, Medellín, Caracas..."
          maxLength={80}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <p className="mt-1 text-xs text-gray-400">
          Ayuda a encontrar intercambios cercanos.
        </p>
      </div>

      {/* WhatsApp */}
      <div>
        <label
          htmlFor="whatsapp"
          className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700"
        >
          <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          value={form.whatsapp}
          onChange={handleChange}
          placeholder="Ej: +57 300 123 4567"
          maxLength={20}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <p className="mt-1 text-xs text-gray-400">
          Incluye el código de país. Ej: +57 para Colombia, +58 para Venezuela.
        </p>

        {/* Preview del enlace de WhatsApp */}
        {whatsappPreview.length > 6 && (
          <a
            href={`https://wa.me/${whatsappPreview}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 hover:underline"
          >
            <MessageCircle className="h-3 w-3" />
            Probar enlace de WhatsApp →
          </a>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Éxito */}
      {saved && (
        <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Perfil guardado correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
