"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";
import { useParams } from "next/navigation";

interface Negocio {
  id: string;
  nombre: string;
  descripcion: string;
  logo_url: string;
  whatsapp: string;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  codigo: string;
}

interface Resena {
  id: string;
  producto_id: string;
  nombre_cliente: string;
  estrellas: number;
  comentario: string;
  creado_en: string;
}

export default function NegocioPage() {
  const params = useParams();
  const negocioId = params?.id as string;
  const supabase = createClient();

  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [resenasPorProducto, setResenasPorProducto] = useState<Record<string, Resena[]>>({});
  const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  
  // Estados para el modal de reseñas
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    loadData();
  }, [negocioId]);

  async function loadData() {
    try {
      // Verificar que Supabase esté configurado
      if (!supabase) {
        setError("Error de configuración: Supabase no está inicializado.");
        setLoading(false);
        return;
      }

      // Verificar si hay usuario autenticado
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);

      // Cargar negocio
      const { data: negocioData, error: negocioError } = await supabase
        .from("negocios")
        .select("*")
        .eq("id", negocioId)
        .single();

      if (negocioError) {
        console.error("Error al cargar negocio:", negocioError);
        setError("No se pudo cargar la información del negocio.");
        setLoading(false);
        return;
      }

      setNegocio(negocioData);

      // Cargar productos del negocio
      const { data: productosData, error: productosError } = await supabase
        .from("productos")
        .select("*")
        .eq("negocio_id", negocioId)
        .order("creado_en", { ascending: false });

      if (productosError) {
        console.error("Error al cargar productos:", productosError);
        setError("No se pudieron cargar los productos.");
        setLoading(false);
        return;
      }

      setProductos(productosData || []);

      // Cargar favoritos del usuario si está autenticado
      if (userData && productosData && productosData.length > 0) {
        const productosIds = productosData.map(p => p.id);
        const { data: favoritosData } = await supabase
          .from("favoritos")
          .select("producto_id")
          .eq("user_id", userData.id)
          .in("producto_id", productosIds);

        if (favoritosData) {
          setFavoritosIds(new Set(favoritosData.map(f => f.producto_id)));
        }
      }

      // Cargar reseñas de todos los productos
      if (productosData && productosData.length > 0) {
        const productosIds = productosData.map(p => p.id);
        const { data: resenasData } = await supabase
          .from("reseñas")
          .select("*")
          .in("producto_id", productosIds)
          .order("creado_en", { ascending: false });

        // Agrupar reseñas por producto
        const resenasAgrupadas: Record<string, Resena[]> = {};
        resenasData?.forEach(resena => {
          if (!resenasAgrupadas[resena.producto_id]) {
            resenasAgrupadas[resena.producto_id] = [];
          }
          resenasAgrupadas[resena.producto_id].push(resena);
        });

        setResenasPorProducto(resenasAgrupadas);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Error inesperado al cargar los datos.");
      setLoading(false);
    }
  }

  async function toggleFavorito(productoId: string) {
    if (!user) {
      // Redirigir al login si no está autenticado
      window.location.href = "/auth/login";
      return;
    }

    const esFavorito = favoritosIds.has(productoId);

    try {
      if (esFavorito) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from("favoritos")
          .delete()
          .eq("user_id", user.id)
          .eq("producto_id", productoId);

        if (error) {
          console.error("Error al eliminar favorito:", error);
          alert("Error al quitar de favoritos. Por favor, intenta de nuevo.");
          return;
        }

        // Actualizar estado local
        const newFavoritos = new Set(favoritosIds);
        newFavoritos.delete(productoId);
        setFavoritosIds(newFavoritos);
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from("favoritos")
          .insert({
            user_id: user.id,
            producto_id: productoId,
          });

        if (error) {
          console.error("Error al agregar favorito:", error);
          
          let errorMessage = "Error al agregar a favoritos.";
          if (error.message.includes("permission denied")) {
            errorMessage = "No tienes permisos para agregar favoritos. Verifica la configuración de Supabase.";
          } else if (error.message.includes("duplicate")) {
            errorMessage = "Este producto ya está en favoritos.";
          }
          
          alert(errorMessage);
          return;
        }

        // Actualizar estado local
        const newFavoritos = new Set(favoritosIds);
        newFavoritos.add(productoId);
        setFavoritosIds(newFavoritos);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado. Por favor, intenta de nuevo.");
    }
  }

  function openReviewModal(producto: Producto) {
    if (!user) {
      // Redirigir al login si no está autenticado
      window.location.href = "/auth/login";
      return;
    }
    setSelectedProducto(producto);
    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
    setShowReviewModal(true);
  }

  async function submitReview() {
    if (!selectedProducto || !user) return;

    if (reviewRating === 0) {
      setReviewError("Por favor, selecciona una calificación");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const { error } = await supabase
        .from("reseñas")
        .insert({
          producto_id: selectedProducto.id,
          nombre_cliente: user.email,
          estrellas: reviewRating,
          comentario: reviewComment.trim(),
        });

      if (error) {
        console.error("Error al enviar reseña:", error);
        
        let errorMessage = "Error al enviar la reseña.";
        if (error.message.includes("permission denied")) {
          errorMessage = "No tienes permisos para enviar reseñas. Verifica la configuración de Supabase.";
        }
        
        setReviewError(errorMessage);
        setSubmittingReview(false);
        return;
      }

      // Recargar reseñas
      await loadData();
      
      // Cerrar modal
      setShowReviewModal(false);
      setSubmittingReview(false);
    } catch (err) {
      console.error("Error inesperado:", err);
      setReviewError("Error inesperado al enviar la reseña.");
      setSubmittingReview(false);
    }
  }

  function renderStars(rating: number, interactive: boolean = false, onClick?: (rating: number) => void) {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < rating;
      return (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onClick && onClick(i + 1)}
          disabled={!interactive}
          className={`text-2xl transition ${
            interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          } ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      );
    });
  }

  function getAverageRating(productoId: string): number {
    const resenas = resenasPorProducto[productoId] || [];
    if (resenas.length === 0) return 0;
    const sum = resenas.reduce((acc, r) => acc + r.estrellas, 0);
    return sum / resenas.length;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !negocio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || "Negocio no encontrado"}
          </h2>
          <a href="/catalogo" className="text-emerald-600 hover:underline font-medium">
            ← Volver al catálogo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo con info del negocio */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a
              href="/catalogo"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al catálogo
            </a>

            {negocio.whatsapp && (
              <a
                href={`https://wa.me/51${negocio.whatsapp}?text=Hola, vi tu catálogo en MercadoLocal y me interesa`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Contactar</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Banner del negocio */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              {negocio.logo_url ? (
                <img
                  src={negocio.logo_url}
                  alt={negocio.nombre}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-xl">
                  <span className="text-6xl">🏢</span>
                </div>
              )}
            </div>

            {/* Info del negocio */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-3">{negocio.nombre}</h1>
              {negocio.descripcion && (
                <p className="text-emerald-100 text-lg mb-4 max-w-2xl">
                  {negocio.descripcion}
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  📦 {productos.length} {productos.length === 1 ? 'Producto' : 'Productos'}
                </span>
                {negocio.whatsapp && (
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                    📱 WhatsApp disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {productos.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Nuestros Productos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map((producto) => {
                const resenas = resenasPorProducto[producto.id] || [];
                const avgRating = getAverageRating(producto.id);
                const esFavorito = favoritosIds.has(producto.id);
                
                return (
                  <div
                    key={producto.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 relative"
                  >
                    {/* Botón de favorito */}
                    <button
                      onClick={() => toggleFavorito(producto.id)}
                      className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition group"
                      title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      <svg 
                        className={`w-6 h-6 transition group-hover:scale-110 ${
                          esFavorito ? 'text-red-500 fill-current' : 'text-gray-400'
                        }`} 
                        fill={esFavorito ? "currentColor" : "none"}
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                    </button>

                    {/* Imagen del producto */}
                    <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800 flex-1">
                          {producto.nombre}
                        </h3>
                        <span className="text-2xl font-bold text-green-600 ml-2">
                          S/ {Number(producto.precio).toFixed(2)}
                        </span>
                      </div>

                      {producto.descripcion && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      )}

                      {/* Calificación promedio */}
                      {resenas.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-sm">
                            {renderStars(Math.round(avgRating))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {avgRating.toFixed(1)} ({resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'})
                          </span>
                        </div>
                      )}

                      {/* Botón para dejar reseña */}
                      <button
                        onClick={() => openReviewModal(producto)}
                        className="w-full mb-3 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm hover:bg-emerald-100 transition border border-emerald-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>{user ? 'Dejar reseña' : 'Inicia sesión para reseñar'}</span>
                      </button>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-gray-500 font-mono">
                          {producto.codigo}
                        </span>

                        {negocio.whatsapp && (
                          <a
                            href={`https://wa.me/51${negocio.whatsapp}?text=Hola, me interesa el producto: *${producto.nombre}* (${producto.codigo})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 transition"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span>Consultar</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aún no hay productos
            </h3>
            <p className="text-gray-600 mb-6">
              Este negocio está preparando su catálogo
            </p>
          </div>
        )}
      </main>

      {/* Modal de Reseña */}
      {showReviewModal && selectedProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Dejar una reseña
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">{selectedProducto.nombre}</p>

            {/* Error */}
            {reviewError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{reviewError}</p>
              </div>
            )}

            {/* Calificación */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación *
              </label>
              <div className="flex gap-1">
                {renderStars(reviewRating, true, setReviewRating)}
              </div>
            </div>

            {/* Comentario */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                placeholder="Cuéntanos tu experiencia con este producto..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview || reviewRating === 0}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? "Enviando..." : "Enviar reseña"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer flotante con WhatsApp (solo móvil) */}
      {negocio.whatsapp && productos.length > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <a
            href={`https://wa.me/51${negocio.whatsapp}?text=Hola, vi tu catálogo y me interesa`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="font-semibold">Contactar</span>
          </a>
        </div>
      )}
    </div>
  );
}