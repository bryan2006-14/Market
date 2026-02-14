"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

interface Resena {
  id: string;
  producto_id: string;
  nombre_cliente: string;
  estrellas: number;
  comentario: string;
  creado_en: string;
  productos: {
    nombre: string;
    imagen_url: string;
  };
}

export default function MisResenasPage() {
  const supabase = createClient();
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user: userData } } = await supabase.auth.getUser();
    
    if (!userData) {
      window.location.href = "/auth/login";
      return;
    }

    setUser(userData);

    // Nota: Aquí asumo que guardaste el email o user_id en la tabla reseñas
    const { data: resenasData } = await supabase
      .from("reseñas")
      .select(`
        *,
        productos (
          nombre,
          imagen_url
        )
      `)
      .eq("nombre_cliente", userData.email)
      .order("creado_en", { ascending: false });

    setResenas(resenasData || []);
    setLoading(false);
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Reseñas</h1>
          <p className="text-gray-600">Todas las opiniones que has dejado sobre productos</p>
        </div>

        {resenas.length > 0 ? (
          <div className="space-y-4">
            {resenas.map((resena) => (
              <div
                key={resena.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {resena.productos?.imagen_url ? (
                        <img
                          src={resena.productos.imagen_url}
                          alt={resena.productos.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Contenido de la reseña */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        {resena.productos?.nombre || "Producto eliminado"}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-xl">
                          {renderStars(resena.estrellas)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(resena.creado_en).toLocaleDateString("es-PE", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      {resena.comentario && (
                        <p className="text-gray-700">{resena.comentario}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No has dejado reseñas todavía
            </h3>
            <p className="text-gray-600 mb-6">
              Explora productos y comparte tu opinión
            </p>
            <a
              href="/catalogo"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Explorar Productos
            </a>
          </div>
        )}
      </main>
    </div>
  );
}