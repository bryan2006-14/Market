"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";

export default function CreateBusinessPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Preview del logo cuando se selecciona
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Subir logo a Supabase Storage
  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error subiendo logo:", uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from("imagenes")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error en uploadLogo:", error);
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
        alert("Debes iniciar sesión para crear un negocio");
        return;
      }

      // 2. Verificar si ya tiene un negocio
      const { data: negocioExistente } = await supabase
        .from("negocios")
        .select("id")
        .eq("usuario_id", user.id)
        .single();

      if (negocioExistente) {
        alert("Ya tienes un negocio creado");
        window.location.href = "/dashboard";
        return;
      }

      // 3. Subir logo si existe
      let logo_url = null;
      if (logo) {
        logo_url = await uploadLogo(logo);
        if (!logo_url) {
          alert("Error al subir el logo");
          return;
        }
      }

      // 4. Crear el negocio
      const { error } = await supabase.from("negocios").insert({
        nombre,
        descripcion: descripcion || null,
        whatsapp: whatsapp || null,
        logo_url,
        usuario_id: user.id,
      });

      if (error) {
        console.error(error);
        alert("Error al crear negocio: " + error.message);
        return;
      }

      alert("✅ ¡Negocio creado exitosamente!");
      window.location.href = "/dashboard/welcome";
    } catch (error) {
      console.error("Error general:", error);
      alert("Error inesperado al crear negocio");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crea tu Negocio</h1>
          <p className="text-gray-600">Configura la información de tu emprendimiento</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          
          {/* Logo del negocio */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Logo del negocio</label>
            <div className="flex items-start gap-6">
              {/* Preview circular */}
              <div className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center bg-gray-50 overflow-hidden">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PNG o JPG (recomendado: cuadrado, máx. 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Nombre del negocio */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Nombre del negocio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border border-gray-300 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Tienda de Ropa Bella"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="border border-gray-300 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Cuenta a tus clientes sobre tu negocio, productos y servicios..."
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">+51</span>
              </div>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="border border-gray-300 pl-12 pr-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="987654321"
                pattern="[0-9]{9}"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Los clientes podrán contactarte por WhatsApp
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </span>
              ) : (
                "✓ Crear Negocio"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}