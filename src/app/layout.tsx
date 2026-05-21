import type { Metadata, Viewport } from "next";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Intercambio de Barajitas",
  description: "Registra tu colección e intercambia barajitas con otros usuarios"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ec7220"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
