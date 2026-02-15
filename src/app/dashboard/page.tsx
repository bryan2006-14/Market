"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";
import Link from "next/link";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  descripcion: string;
  stock: number;
}

export default function Dashboard() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [negocio, setNegocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para las estadísticas
  const [totalProductos, setTotalProductos] = useState(0);
  const [totalResenas, setTotalResenas] = useState(0);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);
  const [productos, setProductos] = useState<Producto[]>([]);

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

        // 4. Cargar estadísticas si tiene negocio
        if (negocioData) {
          await loadEstadisticas(negocioData.id);
          await loadProductos(negocioData.id);
        }
      }

      setLoading(false);
    }
    
    loadUserData();
  }, []);

  async function loadEstadisticas(negocioId: string) {
    // Contar productos
    const { count: productosCount } = await supabase
      .from("productos")
      .select("*", { count: "exact", head: true })
      .eq("negocio_id", negocioId);

    setTotalProductos(productosCount || 0);

    // Contar reseñas y calcular promedio
    const { data: resenasData } = await supabase
      .from("resenas")
      .select("calificacion")
      .eq("negocio_id", negocioId);

    if (resenasData && resenasData.length > 0) {
      setTotalResenas(resenasData.length);
      
      const suma = resenasData.reduce((acc, resena) => acc + resena.calificacion, 0);
      const promedio = suma / resenasData.length;
      setPromedioCalificacion(Math.round(promedio * 10) / 10);
    } else {
      setTotalResenas(0);
      setPromedioCalificacion(0);
    }
  }

  async function loadProductos(negocioId: string) {
    const { data: productosData } = await supabase
      .from("productos")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("creado_en", { ascending: false })
      .limit(6); // Mostrar solo los últimos 6 productos

    setProductos(productosData || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  async function selectRole(role: "cliente" | "emprendedor") {
    if (!user) return;

    const { error } = await supabase.from("perfiles").upsert({
      id: user.id,
      email: user.email,
      rol: role,
    });

    if (error) {
      alert("Error al guardar rol: " + error.message);
      return;
    }

    if (role === "cliente") {
      window.location.href = "/catalogo";
    } else {
      window.location.href = "/dashboard";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // 👇 PANTALLA 1: Usuario sin rol seleccionado
  if (!perfil || !perfil.rol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
              <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              ¿Cómo quieres usar MercadoLocal?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => selectRole("cliente")}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-emerald-500"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition">
                  <span className="text-5xl">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Soy Cliente</h2>
                <p className="text-gray-600 mb-6">
                  Quiero explorar productos y dejar reseñas
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Ver catálogos de productos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dejar reseñas y calificaciones</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Contactar emprendedores</span>
                  </div>
                </div>

                <div className="mt-6 bg-emerald-50 text-emerald-700 py-2 px-4 rounded-lg font-medium group-hover:bg-emerald-100 transition">
                  Continuar como Cliente →
                </div>
              </div>
            </button>

            <button
              onClick={() => selectRole("emprendedor")}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-teal-500"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition">
                  <span className="text-5xl">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Soy Emprendedor</h2>
                <p className="text-gray-600 mb-6">
                  Quiero gestionar mi negocio y productos
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Crear mi catálogo digital</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Gestionar productos y precios</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Recibir reseñas de clientes</span>
                  </div>
                </div>

                <div className="mt-6 bg-teal-50 text-teal-700 py-2 px-4 rounded-lg font-medium group-hover:bg-teal-100 transition">
                  Continuar como Emprendedor →
                </div>
              </div>
            </button>
          </div>

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-emerald-600 rounded-full mb-4">
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

          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              ¿Qué incluye tu negocio?
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span> Catálogo de productos personalizado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span> Sistema de reseñas de clientes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span> Contacto directo por WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span> Logo y descripción de tu marca
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/business/new"
              className="block w-full bg-emerald-600 text-white text-center px-6 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-md hover:shadow-lg"
            >
              ✨ Crear mi Negocio Ahora
            </Link>
            
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {negocio?.logo_url ? (
                <img 
                  src={negocio.logo_url} 
                  alt={negocio.nombre}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-2 border-emerald-200">
                  <span className="text-2xl">🏪</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{negocio?.nombre}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/welcome"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Inicio</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Control</h2>
          <p className="text-gray-600">Gestiona tu negocio desde aquí</p>
        </div>

        {/* Stats rápidas con datos REALES */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Productos</p>
                <p className="text-3xl font-bold mt-1">{totalProductos}</p>
                {totalProductos === 0 && (
                  <p className="text-xs text-emerald-100 mt-2">Agrega tus primeros productos</p>
                )}
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Reseñas</p>
                <p className="text-3xl font-bold mt-1">{totalResenas}</p>
                {totalResenas === 0 && (
                  <p className="text-xs text-yellow-100 mt-2">Aún no tienes reseñas</p>
                )}
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Calificación Promedio</p>
                <p className="text-3xl font-bold mt-1">
                  {promedioCalificacion > 0 ? `${promedioCalificacion} ⭐` : 'Sin calif.'}
                </p>
                {promedioCalificacion === 0 && (
                  <p className="text-xs text-teal-100 mt-2">Espera tus primeras reseñas</p>
                )}
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Productos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Mis Productos</h3>
              <p className="text-sm text-gray-500">Vista rápida de tu catálogo</p>
            </div>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Producto
            </Link>
          </div>

          {productos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productos.map((producto) => (
                <div key={producto.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {producto.imagen_url ? (
                      <img 
                        src={producto.imagen_url} 
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">📦</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 mb-1 truncate">{producto.nombre}</h4>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{producto.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">
                          S/ {producto.precio.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {producto.stock || 0}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/products/edit/${producto.id}`}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                      >
                        Editar
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Aún no tienes productos
              </h3>
              <p className="text-gray-500 mb-6">
                Comienza agregando tu primer producto al catálogo
              </p>
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Primer Producto
              </Link>
            </div>
          )}

          {productos.length >= 6 && (
            <div className="mt-4 text-center">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Ver todos los productos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/products"
            className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-emerald-400"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition">
                  Gestionar Productos
                </h3>
                <p className="text-sm text-gray-500">Administra tu catálogo</p>
              </div>
            </div>
            <div className="flex items-center text-emerald-600 text-sm font-medium">
              <span>Ir a productos</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/dashboard/reviews"
            className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-yellow-400"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-yellow-600 transition">
                  Reseñas
                </h3>
                <p className="text-sm text-gray-500">Ver opiniones</p>
              </div>
            </div>
            <div className="flex items-center text-yellow-600 text-sm font-medium">
              <span>Ver reseñas</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/dashboard/business/edit"
            className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-teal-400"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition">
                  Mi Negocio
                </h3>
                <p className="text-sm text-gray-500">Editar información</p>
              </div>
            </div>
            <div className="flex items-center text-teal-600 text-sm font-medium">
              <span>Configurar</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}