"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

export default function WelcomePage() {
  const supabase = createClient();
  const [negocio, setNegocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const { data: negocioData } = await supabase
        .from("negocios")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (!negocioData) {
        window.location.href = "/dashboard/business/new";
        return;
      }

      setNegocio(negocioData);
      setLoading(false);
    }
    
    loadBusiness();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Confetti/Celebration effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl animate-bounce">🎉</div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
        <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🚀</div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Header de celebración */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-white rounded-full shadow-xl mb-6 animate-pulse">
            {negocio?.logo_url ? (
              <img 
                src={negocio.logo_url} 
                alt={negocio.nombre}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <svg className="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            ¡Felicidades! 🎉
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Tu negocio <span className="font-bold text-blue-600">{negocio?.nombre}</span> está listo
          </p>
          <p className="text-lg text-gray-600">
            Ahora puedes comenzar a gestionar tus productos y recibir reseñas
          </p>
        </div>

        {/* Pasos siguientes */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🚀 ¿Qué puedes hacer ahora?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Paso 1: Agregar productos */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition border-2 border-blue-200">
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                1
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛍️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Agrega Productos
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Crea tu catálogo con fotos, precios y descripciones
                </p>
                <a
                  href="/dashboard/products/new"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Crear producto →
                </a>
              </div>
            </div>

            {/* Paso 2: Compartir catálogo */}
            <div className="group relative bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition border-2 border-green-200">
              <div className="absolute -top-4 -right-4 bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                2
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Comparte tu Catálogo
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Envía el link a tus clientes por WhatsApp o redes sociales
                </p>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/catalogo/${negocio.id}`;
                    navigator.clipboard.writeText(link);
                    alert("¡Link copiado! Compártelo con tus clientes");
                  }}
                  className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Copiar link →
                </button>
              </div>
            </div>

            {/* Paso 3: Recibir reseñas */}
            <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl hover:shadow-lg transition border-2 border-yellow-200">
              <div className="absolute -top-4 -right-4 bg-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                3
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Recibe Reseñas
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tus clientes podrán dejar opiniones y calificaciones
                </p>
                <a
                  href="/dashboard/reviews"
                  className="block w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition"
                >
                  Ver reseñas →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>💡</span> Tips para empezar
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Usa fotos de calidad</h4>
                <p className="text-sm text-gray-600">Las imágenes claras aumentan las ventas hasta en un 60%</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Describe bien tus productos</h4>
                <p className="text-sm text-gray-600">Incluye características, materiales y beneficios</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Responde rápido por WhatsApp</h4>
                <p className="text-sm text-gray-600">Los clientes valoran la atención inmediata</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Pide reseñas a tus clientes</h4>
                <p className="text-sm text-gray-600">Las opiniones generan confianza en nuevos compradores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para ir al dashboard */}
        <div className="text-center">
          <a
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            Ir a mi Panel de Control →
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Podrás volver aquí cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}