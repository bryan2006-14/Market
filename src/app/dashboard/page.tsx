"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

export default function Dashboard() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [negocio, setNegocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      // 1. Cargar usuario
      const { data: { user: userData } } = await supabase.auth.getUser();
      
      if (!userData) {
        window.location.href = "/auth/login";
        return;
      }

      setUser(userData);

      // 2. Verificar si tiene perfil (con rol guardado)
      const { data: perfilData } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userData.id)
        .single();

      setPerfil(perfilData);

      // 3. Si es emprendedor, verificar si tiene negocio
      if (perfilData?.rol === "emprendedor") {
        const { data: negocioData } = await supabase
          .from("negocios")
          .select("*")
          .eq("usuario_id", userData.id)
          .single();

        setNegocio(negocioData);
      }

      setLoading(false);
    }
    
    loadUserData();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  async function selectRole(role: "cliente" | "emprendedor") {
    if (!user) return;

    // Guardar el rol en la tabla perfiles
    const { error } = await supabase.from("perfiles").upsert({
      id: user.id,
      email: user.email,
      rol: role,
    });

    if (error) {
      alert("Error al guardar rol: " + error.message);
      return;
    }

    // Redirigir según el rol
    if (role === "cliente") {
      window.location.href = "/catalogo";
    } else {
      window.location.href = "/dashboard";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // 👇 PANTALLA 1: Usuario sin rol seleccionado
  if (!perfil || !perfil.rol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              ¡Bienvenido! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Hola <span className="font-semibold">{user?.email}</span>
            </p>
            <p className="text-gray-500 mt-2">
              ¿Cómo quieres usar LlallyTech?
            </p>
          </div>

          {/* Selector de roles */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* Opción: Cliente */}
            <button
              onClick={() => selectRole("cliente")}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-green-500"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                  <span className="text-5xl">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Soy Cliente</h2>
                <p className="text-gray-600 mb-6">
                  Quiero explorar productos y dejar reseñas
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Ver catálogos de productos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dejar reseñas y calificaciones</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Contactar emprendedores</span>
                  </div>
                </div>

                <div className="mt-6 bg-green-50 text-green-700 py-2 px-4 rounded-lg font-medium group-hover:bg-green-100 transition">
                  Continuar como Cliente →
                </div>
              </div>
            </button>

            {/* Opción: Emprendedor */}
            <button
              onClick={() => selectRole("emprendedor")}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                  <span className="text-5xl">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Soy Emprendedor</h2>
                <p className="text-gray-600 mb-6">
                  Quiero gestionar mi negocio y productos
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Crear mi catálogo digital</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Gestionar productos y precios</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Recibir reseñas de clientes</span>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg font-medium group-hover:bg-blue-100 transition">
                  Continuar como Emprendedor →
                </div>
              </div>
            </button>

          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              Puedes cambiar tu rol más adelante en configuración
            </p>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 👇 PANTALLA 2A: Cliente (redirige al catálogo)
  if (perfil.rol === "cliente") {
    window.location.href = "/catalogo";
    return null;
  }

  // 👇 PANTALLA 2B: Emprendedor sin negocio (crear negocio)
  if (perfil.rol === "emprendedor" && !negocio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-600 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🚀 Crea tu Negocio
            </h1>
            <p className="text-gray-600">
              Para comenzar a vender, primero configura tu negocio
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              ¿Qué incluye tu negocio?
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Catálogo de productos personalizado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Sistema de reseñas de clientes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Contacto directo por WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Logo y descripción de tu marca
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <a
              href="/dashboard/business/new"
              className="block w-full bg-blue-600 text-white text-center px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              ✨ Crear mi Negocio Ahora
            </a>
            
            <button
              onClick={logout}
              className="block w-full bg-gray-100 text-gray-700 text-center px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 👇 PANTALLA 3: Emprendedor con negocio (dashboard completo)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {negocio?.logo_url && (
                <img 
                  src={negocio.logo_url} 
                  alt={negocio.nombre}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{negocio?.nombre}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Panel de Control</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/dashboard/products"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            🛍️ <strong>Productos</strong>
            <p className="text-sm text-gray-600 mt-1">Gestiona tu catálogo</p>
          </a>

          <a
            href="/dashboard/reviews"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            ⭐ <strong>Reseñas</strong>
            <p className="text-sm text-gray-600 mt-1">Ver opiniones</p>
          </a>

          <a
            href="/dashboard/business/edit"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            🏢 <strong>Mi Negocio</strong>
            <p className="text-sm text-gray-600 mt-1">Editar información</p>
          </a>
        </div>
      </main>
    </div>
  );
}