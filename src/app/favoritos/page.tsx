"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

export default function FavoritosPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/catalogo" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al catálogo
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">❤️ Mis Favoritos</h1>
          <p className="text-gray-600">Productos que has guardado para ver más tarde</p>
        </div>

        {/* Estado: Funcionalidad próximamente */}
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-block p-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            🚧 Función en Desarrollo
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Estamos trabajando en esta funcionalidad. Pronto podrás guardar tus productos favoritos
            y acceder a ellos fácilmente desde aquí.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Próximamente podrás:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left">
              <li>• Guardar productos con un click en ❤️</li>
              <li>• Ver todos tus favoritos en un solo lugar</li>
              <li>• Recibir notificaciones de cambios de precio</li>
              <li>• Compartir tu lista de favoritos</li>
            </ul>
          </div>

          <a
            href="/catalogo"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Explorar Productos
          </a>
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">¿Cómo funcionará?</h3>
              <p className="text-sm text-yellow-700">
                Cuando esta función esté lista, verás un ícono de corazón en cada producto.
                Al hacer click, el producto se guardará aquí automáticamente para que puedas
                encontrarlo fácilmente después.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}