"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

interface Negocio {
  id: string;
  nombre: string;
  descripcion: string;
  logo_url: string;
  whatsapp: string;
}

export default function Home() {
  const supabase = createClient();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNegocios();
  }, []);

  async function loadNegocios() {
    const { data } = await supabase
      .from("negocios")
      .select("*")
      .order("creado_en", { ascending: false })
      .limit(6); // Mostrar solo los últimos 6 en la página principal

    setNegocios(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-900 dark:to-black">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-sm dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              MercadoLocal
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/catalogo"
                className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
              >
                Catálogo
              </Link>
              <Link
                href="/auth/login"
                className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
              MercadoLocal
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              Conectando emprendedores con su comunidad
            </p>
          </div>

          <h2 className="max-w-3xl text-4xl font-bold leading-tight text-zinc-900 dark:text-white sm:text-5xl">
            Descubre los mejores productos y servicios de tu pueblo
          </h2>
          
          <p className="mt-6 max-w-2xl text-xl text-zinc-600 dark:text-zinc-300">
            Apoya a los emprendedores locales. Explora productos únicos, lee reseñas de tu comunidad y contacta directamente por WhatsApp.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/catalogo"
              className="rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-lg"
            >
              Explorar Productos
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border-2 border-emerald-600 px-8 py-4 text-lg font-semibold text-emerald-600 transition-all hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              Soy Emprendedor
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-zinc-800">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
              Descubre Local
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Encuentra productos y servicios únicos de emprendedores de tu comunidad
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-zinc-800">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
              Contacto Directo
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Conecta fácilmente vía WhatsApp con los vendedores para coordinar tu compra
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-zinc-800">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
              Reseñas Confiables
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Lee opiniones reales de tu comunidad antes de comprar
            </p>
          </div>
        </div>

        {/* Negocios Destacados */}
        {!loading && negocios.length > 0 && (
          <div className="mt-24">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Negocios Destacados
              </h2>
              <Link
                href="/catalogo"
                className="text-emerald-600 hover:text-emerald-700 font-semibold dark:text-emerald-400"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {negocios.map((negocio) => (
                <Link
                  key={negocio.id}
                  href={`/catalogo/${negocio.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-zinc-800"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center p-6">
                    {negocio.logo_url ? (
                      <img src={negocio.logo_url} alt={negocio.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-6xl">🏪</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-zinc-900 group-hover:text-emerald-600 transition dark:text-white">
                      {negocio.nombre}
                    </h3>
                    {negocio.descripcion && (
                      <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {negocio.descripcion}
                      </p>
                    )}
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Ver productos →
                      </span>
                      {negocio.whatsapp && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="mt-24">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-white">
            ¿Cómo funciona?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                Explora
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Navega por categorías y descubre productos locales
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                Contacta
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Haz clic en WhatsApp para hablar directamente con el vendedor
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                Compra Local
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Coordina la entrega o recogida directamente con el emprendedor
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-24 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            ¿Eres emprendedor?
          </h2>
          <p className="mb-8 text-xl text-emerald-50">
            Únete a nuestra comunidad y llega a más clientes locales
          </p>
          <Link
            href="/auth/login"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-emerald-600 transition-all hover:shadow-lg"
          >
            Registra tu Negocio Gratis
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            © 2024 MercadoLocal. Apoyando emprendedores locales.
          </p>
        </div>
      </footer>
    </div>
  );
}