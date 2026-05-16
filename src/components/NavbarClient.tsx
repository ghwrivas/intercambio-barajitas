"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  isAuthed: boolean;
  displayName: string | null;
  avatarUrl: string | null;
};

export default function NavbarClient({ isAuthed, displayName, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = isAuthed
    ? [
        { href: "/dashboard", label: "Inicio" },
        { href: "/mi-coleccion", label: "Mi colección" },
        { href: "/comparar", label: "Comparar" }
      ]
    : [
        { href: "/", label: "Inicio" },
        { href: "/albumes", label: "Álbumes" }
      ];

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-600">
          <span className="text-2xl">🎴</span>
          <span className="hidden sm:inline">Intercambio de Barajitas</span>
          <span className="sm:hidden">Barajitas</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-700 hover:text-brand-600">
              {l.label}
            </Link>
          ))}
          {isAuthed ? (
            <div className="flex items-center gap-3">
              <Link
                href="/perfil"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-brand-600"
                title="Mi perfil"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="max-w-[120px] truncate">{displayName}</span>
              </Link>
              <button onClick={signOut} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
              Entrar
            </Link>
          )}
        </nav>

        {/* Mobile button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isAuthed ? (
              <>
                <Link
                  href="/perfil"
                  className="block rounded px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Mi perfil
                </Link>
                <button onClick={signOut} className="block w-full rounded px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" className="block rounded bg-brand-600 px-3 py-2 text-center text-base font-medium text-white">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
