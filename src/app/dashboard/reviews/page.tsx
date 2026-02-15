"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";
import Link from "next/link";

interface Resena {
  id: string;
  calificacion: number;
  comentario: string;
  creado_en: string;
  perfiles: {
    email: string;
  };
  productos: {
    nombre: string;
  };
}

export default function ReviewsPage() {
  const supabase = createClient();
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [negocio, setNegocio] = useState<any>(null);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    // Obtener negocio
    const { data: negocioData } = await supabase
      .from("negocios")
      .select("*")
      .eq("usuario_id", user.id)
      .single();

    if (!negocioData) {
      alert("No se encontró tu negocio");
      window.location.href = "/dashboard";
      return;
    }

    setNegocio(negocioData);

    // Obtener reseñas del negocio con joins
    const { data: resenasData } = await supabase
      .from("resenas")
      .select(`
        *,
        perfiles (email),
        productos (nombre)
      `)
      .eq("negocio_id", negocioData.id)
      .order("creado_en", { ascending: false });

    if (resenasData && resenasData.length > 0) {
      setResenas(resenasData);
      
      // Calcular promedio
      const suma = resenasData.reduce((acc, r) => acc + r.calificacion, 0);
      const promedio = suma / resenasData.length;
      setPromedioCalificacion(Math.round(promedio * 10) / 10);
    }

    setLoading(false);
  }

  const renderStars = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < calificacion ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            {negocio?.logo_url ? (
              <img 
                src={negocio.logo_url} 
                alt={negocio.nombre}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-2 border-emerald-200">
                <span className="text-3xl">⭐</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reseñas de {negocio?.nombre}</h1>
              <p className="text-gray-600">Opiniones de tus clientes</p>
            </div>
          </div>
        </div>

        {/* Resumen de calificaciones */}
        {resenas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Promedio */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                  {promedioCalificacion}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(promedioCalificacion))}
                </div>
                <p className="text-gray-600 text-sm">Calificación promedio</p>
              </div>

              {/* Total de reseñas */}
              <div className="text-center border-l border-r border-gray-200">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                  {resenas.length}
                </div>
                <p className="text-gray-600 text-sm">
                  {resenas.length === 1 ? 'Reseña total' : 'Reseñas totales'}
                </p>
              </div>

              {/* Distribución */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = resenas.filter(r => r.calificacion === star).length;
                  const percentage = resenas.length > 0 ? (count / resenas.length) * 100 : 0;
                  
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-8">{star}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Lista de reseñas */}
        {resenas.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Todas las reseñas ({resenas.length})
            </h2>
            
            {resenas.map((resena) => (
              <div
                key={resena.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-emerald-700">
                        {resena.perfiles?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {resena.perfiles?.email?.split('@')[0] || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(resena.creado_en)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {renderStars(resena.calificacion)}
                  </div>
                </div>

                {resena.productos && (
                  <div className="mb-3 inline-block">
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                      📦 {resena.productos.nombre}
                    </span>
                  </div>
                )}

                {resena.comentario && (
                  <p className="text-gray-700 leading-relaxed">
                    "{resena.comentario}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Estado vacío
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Aún no tienes reseñas
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Cuando tus clientes dejen reseñas sobre tus productos, aparecerán aquí. 
              Comparte tus productos para recibir feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ver mis productos
              </Link>
              <Link
                href={`/catalogo/${negocio?.id}`}
                className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver mi catálogo público
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}