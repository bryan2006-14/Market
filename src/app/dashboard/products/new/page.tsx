"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

export default function NewProductPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Preview de la imagen cuando se selecciona
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Subir imagen a Supabase Storage
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
      // 1. Obtener el usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert("Debes iniciar sesión para crear productos");
        return;
      }

      // 2. Obtener el negocio_id del usuario
      const { data: negocio, error: negocioError } = await supabase
        .from("negocios")
        .select("id")
        .eq("usuario_id", user.id)
        .single();

      if (negocioError || !negocio) {
        alert("Primero debes crear un negocio");
        return;
      }

      // 3. Subir imagen si existe
      let imagen_url = null;
      if (imagen) {
        imagen_url = await uploadImage(imagen);
        if (!imagen_url) {
          alert("Error al subir la imagen");
          return;
        }
      }

      // 4. Crear el producto
      const { error } = await supabase.from("productos").insert({
        nombre,
        descripcion: descripcion || null,
        precio: parseFloat(precio),
        imagen_url,
        negocio_id: negocio.id,
        usuario_id: user.id,
        // El código se genera automáticamente con tu función
      });

      if (error) {
        console.error(error);
        alert("Error al crear producto: " + error.message);
        return;
      }

      alert("✅ Producto creado exitosamente");
      window.location.href = "/dashboard/products";
    } catch (error) {
      console.error("Error general:", error);
      alert("Error inesperado al crear producto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Nuevo Producto</h1>
        <p className="text-gray-600">Completa los datos de tu nuevo producto</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        
        {/* Imagen del producto */}
        <div>
          <label className="block mb-2 font-medium">Imagen del producto</label>
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">Sin imagen</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG o WEBP (máx. 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block mb-2 font-medium">
            Nombre del producto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border border-gray-300 px-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Zapatillas deportivas Nike"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block mb-2 font-medium">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border border-gray-300 px-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Describe tu producto, características, materiales, etc."
          />
        </div>

        {/* Precio y Stock en dos columnas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Precio */}
          <div>
            <label className="block mb-2 font-medium">
              Precio (S/) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block mb-2 font-medium">Stock (opcional)</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="border border-gray-300 px-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deja en blanco si no manejas inventario
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {uploading ? "Creando..." : "✓ Crear Producto"}
          </button>
          
          <a
            href="/dashboard/products"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}