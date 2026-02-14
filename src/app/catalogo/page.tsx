"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";
import Link from "next/link";

interface Negocio {
  id: string;
  nombre: string;
  descripcion: string;
  logo_url: string;
  whatsapp: string;
}

export default function CatalogoPage() {
  const supabase = createClient();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Obtener usuario (puede ser null si no está autenticado)
    const { data: { user: userData } } = await supabase.auth.getUser();
    setUser(userData);

    // Cargar negocios (público, no requiere autenticación)
    const { data: negociosData } = await supabase
      .from("negocios")
      .select("*")
      .order("creado_en", { ascending: false});

    setNegocios(negociosData || []);
    setLoading(false);
  }

  async function cambiarARol() {
    if (!user) {
      // Si no hay usuario, redirigir al login
      window.location.href = "/auth/login";
      return;
    }

    if (confirm("¿Quieres cambiar a modo Emprendedor? Podrás crear tu propio negocio.")) {
      const { error } = await supabase
        .from("perfiles")
        .update({ rol: "emprendedor" })
        .eq("id", user.id);

      if (error) {
        alert("Error al cambiar rol: " + error.message);
        return;
      }

      alert("✅ ¡Ahora eres emprendedor! Te llevaremos a crear tu negocio.");
      window.location.href = "/dashboard";
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div>
                <h1 className="text-2xl font-bold text-emerald-600">MercadoLocal</h1>
                <p className="text-sm text-gray-500">Descubre productos de emprendedores</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={cambiarARol}
                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition font-medium shadow-md"
                  >
                    <span>🚀</span>
                    <span>Ser Emprendedor</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <svg className={`w-4 h-4 text-gray-600 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showMenu && (
                      <>
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-30">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.email?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">
                                  {user?.email?.split('@')[0]}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 px-2 py-1 bg-green-50 rounded text-xs text-green-700 font-medium text-center">
                              👤 Modo Cliente
                            </div>
                          </div>

                          <div className="py-1">
                            <Link
                              href="/perfil"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <div>
                                <p className="font-medium text-gray-800">Mi Perfil</p>
                                <p className="text-xs text-gray-500">Ver y editar información</p>
                              </div>
                            </Link>

                            <Link
                              href="/mis-resenas"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <div>
                                <p className="font-medium text-gray-800">Mis Reseñas</p>
                                <p className="text-xs text-gray-500">Ver opiniones que dejé</p>
                              </div>
                            </Link>

                            <Link
                              href="/favoritos"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <div>
                                <p className="font-medium text-gray-800">Favoritos</p>
                                <p className="text-xs text-gray-500">Productos guardados</p>
                              </div>
                            </Link>
                          </div>

                          <div className="border-t border-gray-100 py-1">
                            <button
                              onClick={cambiarARol}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-emerald-50 transition w-full text-left"
                            >
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <div>
                                <p className="font-medium text-emerald-600">Ser Emprendedor</p>
                                <p className="text-xs text-emerald-500">Crea tu negocio</p>
                              </div>
                            </button>
                          </div>

                          <div className="border-t border-gray-100 py-1">
                            <button
                              onClick={logout}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition w-full text-left"
                            >
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <div>
                                <p className="font-medium text-red-600">Cerrar Sesión</p>
                                <p className="text-xs text-red-500">Salir de la cuenta</p>
                              </div>
                            </button>
                          </div>
                        </div>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      </>
                    )}
                  </div>
                </>
              ) : (
                // Usuario no autenticado
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-emerald-600 font-medium"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/auth/login"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">¿Tienes un emprendimiento?</h2>
                <p className="text-emerald-100">Crea tu catálogo digital gratis y comienza a vender en línea</p>
              </div>
              <button onClick={cambiarARol} className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition shadow-md whitespace-nowrap">
                🚀 Crear mi Negocio
              </button>
            </div>
          </div>
        )}

        {negocios.length > 0 ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Negocios Disponibles ({negocios.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {negocios.map((negocio) => (
                <div key={negocio.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-emerald-400">
                  <Link href={`/catalogo/${negocio.id}`} className="block h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center p-6">
                    {negocio.logo_url ? (
                      <img src={negocio.logo_url} alt={negocio.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-4xl">🏪</span>
                        </div>
                        <p className="text-gray-500 text-sm">Sin logo</p>
                      </div>
                    )}
                  </Link>
                  <div className="p-6">
                    <Link href={`/catalogo/${negocio.id}`}>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition">{negocio.nombre}</h3>
                    </Link>
                    {negocio.descripcion && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{negocio.descripcion}</p>}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Link href={`/catalogo/${negocio.id}`} className="text-emerald-600 font-medium text-sm hover:underline">Ver productos →</Link>
                      {negocio.whatsapp && (
                        <a href={`https://wa.me/51${negocio.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 text-sm hover:text-green-700 transition">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
              <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Aún no hay negocios disponibles</h3>
            <p className="text-gray-600 mb-6">¡Sé el primero en crear tu negocio!</p>
            <Link href="/auth/login" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-md">
              🚀 Crear mi Negocio
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}