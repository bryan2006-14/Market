"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const supabase = createClient();
  const params = useParams();
  const productId = params.id as string;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagenActual, setImagenActual] = useState<string>("");
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducto();
  }, []);

  async function loadProducto() {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      alert("Error al cargar el producto");
      window.location.href = "/dashboard";
      return;
    }

    if (data) {
      setNombre(data.nombre);
      setDescripcion(data.descripcion || "");
      setPrecio(data.precio.toString());
      setStock(data.stock?.toString() || "");
      setImagenActual(data.imagen_url || "");
      setPreviewUrl(data.imagen_url || "");
    }

    setLoading(false);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaImagen(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error subiendo imagen:", uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from("imagenes")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error en uploadImage:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imagen_url = imagenActual;

      // Si hay nueva imagen, subirla
      if (nuevaImagen) {
        const nuevaUrl = await uploadImage(nuevaImagen);
        if (nuevaUrl) {
          imagen_url = nuevaUrl;
        }
      }

      // Actualizar producto
      const { error } = await supabase
        .from("productos")
        .update({
          nombre,
          descripcion: descripcion || null,
          precio: parseFloat(precio),
          stock: stock ? parseInt(stock) : null,
          imagen_url,
        })
        .eq("id", productId);

      if (error) {
        console.error(error);
        alert("Error al actualizar producto: " + error.message);
        return;
      }

      alert("✅ Producto actualizado exitosamente");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error general:", error);
      alert("Error inesperado al actualizar producto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id", productId);

      if (error) {
        alert("Error al eliminar producto: " + error.message);
        return;
      }

      alert("✅ Producto eliminado exitosamente");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error inesperado al eliminar producto");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Editar Producto</h1>
              <p className="text-gray-600">Actualiza la información de tu producto</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-6">
            
            {/* Imagen del producto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Imagen del producto
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Preview */}
                <div className="relative group">
                  <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden group-hover:border-teal-400 transition">
                    {previewUrl ? (
                      <>
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <p className="text-white text-sm font-medium">Cambiar</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Sin imagen</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input */}
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-teal-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-600
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-teal-50 file:text-teal-700
                        hover:file:bg-teal-100 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-3">
                      📸 PNG, JPG o WEBP (máx. 5MB)
                    </p>
                    {imagenActual && !nuevaImagen && (
                      <p className="text-xs text-teal-600 mt-2">
                        ✓ Usando imagen actual
                      </p>
                    )}
                    {nuevaImagen && (
                      <p className="text-xs text-teal-600 mt-2">
                        ✓ Nueva imagen seleccionada
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Divisor */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                placeholder="Ej: Zapatillas deportivas Nike"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-900 placeholder:text-gray-400 resize-none"
                rows={4}
                placeholder="Describe tu producto: características, materiales, tamaños disponibles..."
              />
            </div>

            {/* Precio y Stock */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio (S/) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-900"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock (opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                  placeholder="Cantidad disponible"
                />
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando cambios...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Cambios
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {deleting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </>
              )}
            </button>
            
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}