"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  codigo: string;
  negocio_id: string;
  negocios: {
    nombre: string;
    whatsapp: string;
  };
}

interface Favorito {
  id: string;
  producto_id: string;
  user_id: string;
  creado_en: string;
  productos: Producto;
}

export default function FavoritosPage() {
  const supabase = createClient();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Verificar que Supabase esté configurado
      if (!supabase) {
        setError("Error de configuración: Supabase no está inicializado.");
        setLoading(false);
        return;
      }

      const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error al obtener usuario:", userError);
        setError("Error al obtener información del usuario.");
        setLoading(false);
        return;
      }

      if (!userData) {
        // Guardar la URL actual para redirigir después del login
        window.location.href = "/auth/login?redirect=/favoritos";
        return;
      }

      setUser(userData);

      // Cargar favoritos del usuario con información de productos y negocios
      const { data: favoritosData, error: favoritosError } = await supabase
        .from("favoritos")
        .select(`
          *,
          productos (
            *,
            negocios (
              nombre,
              whatsapp
            )
          )
        `)
        .eq("user_id", userData.id)
        .order("creado_en", { ascending: false });

      if (favoritosError) {
        console.error("Error al cargar favoritos:", favoritosError);
        
        // Traducir errores comunes
        let errorMessage = favoritosError.message;
        
        if (favoritosError.message.includes("permission denied") || favoritosError.message.includes("not found")) {
          errorMessage = "No tienes permisos para ver los favoritos o la tabla no existe. Verifica la configuración de Supabase.";
        } else if (favoritosError.message.includes("network") || favoritosError.message.includes("fetch")) {
          errorMessage = "Error de conexión con la base de datos. Verifica tu conexión.";
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      setFavoritos(favoritosData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Error inesperado al cargar los favoritos. Por favor, intenta de nuevo.");
      setLoading(false);
    }
  }

  async function removeFavorito(favoritoId: string) {
    try {
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("id", favoritoId);

      if (error) {
        console.error("Error al eliminar favorito:", error);
        alert("Error al eliminar el favorito. Por favor, intenta de nuevo.");
        return;
      }

      // Actualizar la lista de favoritos
      setFavoritos(favoritos.filter(f => f.id !== favoritoId));
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado al eliminar el favorito.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/catalogo" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
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
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Usuario: {user.email}
            </p>
          )}
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </p>
          </div>
        )}

        {!error && favoritos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritos.map((favorito) => {
              const producto = favorito.productos;
              if (!producto) return null;

              return (
                <div
                  key={favorito.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 relative"
                >
                  {/* Botón para quitar de favoritos */}
                  <button
                    onClick={() => removeFavorito(favorito.id)}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 transition group"
                    title="Quitar de favoritos"
                  >
                    <svg className="w-6 h-6 text-red-500 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Imagen del producto */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {producto.imagen_url ? (
                      <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Sin imagen</p>
                      </div>
                    )}
                  </div>

                  {/* Info del producto */}
                  <div className="p-5">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">
                        {producto.negocios?.nombre || "Negocio"}
                      </p>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {producto.nombre}
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        S/ {Number(producto.precio).toFixed(2)}
                      </p>
                    </div>

                    {producto.descripcion && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {/* Botón para ver producto */}
                      <a
                        href={`/catalogo/${producto.negocio_id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </a>

                      {/* Botón de WhatsApp */}
                      {producto.negocios?.whatsapp && (
                        <a
                          href={`https://wa.me/51${producto.negocios.whatsapp}?text=Hola, me interesa el producto: *${producto.nombre}* (${producto.codigo})`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
                          title="Contactar por WhatsApp"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      )}
                    </div>

                    {/* Código del producto */}
                    <p className="text-xs text-gray-500 font-mono mt-3 text-center">
                      {producto.codigo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !error ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-pink-50 to-red-50 rounded-full mb-6">
              <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No tienes favoritos todavía
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Explora productos y guarda tus favoritos para verlos más tarde
            </p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-sm text-emerald-800">
                <strong>💡 Cómo agregar favoritos:</strong>
              </p>
              <ul className="text-sm text-emerald-700 mt-2 space-y-1 text-left">
                <li>• Busca productos en el catálogo</li>
                <li>• Haz click en el ícono de corazón ❤️</li>
                <li>• Encuentra todos tus favoritos aquí</li>
                <li>• Contacta directamente por WhatsApp</li>
              </ul>
            </div>

            <a
              href="/catalogo"
              className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Explorar Productos
            </a>
          </div>
        ) : null}

        {/* Info adicional sobre favoritos */}
        {!error && favoritos.length > 0 && (
          <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800 mb-1">
                  Tienes {favoritos.length} {favoritos.length === 1 ? 'producto favorito' : 'productos favoritos'}
                </h3>
                <p className="text-sm text-emerald-700">
                  Puedes quitar productos de favoritos haciendo click en el corazón rojo.
                  Los favoritos se guardan en tu cuenta y puedes acceder a ellos desde cualquier dispositivo.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}