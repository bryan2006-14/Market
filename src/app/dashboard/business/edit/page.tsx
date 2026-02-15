"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";
import Link from "next/link";

export default function EditBusinessPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoActual, setLogoActual] = useState<string>("");
  const [nuevoLogo, setNuevoLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [negocioId, setNegocioId] = useState<string>("");

  useEffect(() => {
    loadNegocio();
  }, []);

  async function loadNegocio() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data: negocio, error } = await supabase
      .from("negocios")
      .select("*")
      .eq("usuario_id", user.id)
      .single();

    if (error || !negocio) {
      alert("No se encontró tu negocio");
      window.location.href = "/dashboard";
      return;
    }

    setNegocioId(negocio.id);
    setNombre(negocio.nombre);
    setDescripcion(negocio.descripcion || "");
    setWhatsapp(negocio.whatsapp || "");
    setLogoActual(negocio.logo_url || "");
    setPreviewUrl(negocio.logo_url || "");
    setLoading(false);
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevoLogo(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

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
      let logo_url = logoActual;

      if (nuevoLogo) {
        const nuevaUrl = await uploadLogo(nuevoLogo);
        if (nuevaUrl) {
          logo_url = nuevaUrl;
        }
      }

      const { error } = await supabase
        .from("negocios")
        .update({
          nombre,
          descripcion: descripcion || null,
          whatsapp: whatsapp || null,
          logo_url,
        })
        .eq("id", negocioId);

      if (error) {
        console.error(error);
        alert("Error al actualizar negocio: " + error.message);
        setUploading(false);
        return;
      }

      alert("✅ ¡Negocio actualizado exitosamente!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error general:", error);
      alert("Error inesperado al actualizar negocio");
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
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
          <div className="text-center">
            <div className="inline-block p-3 bg-teal-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Negocio</h1>
            <p className="text-gray-600">Actualiza la información de tu emprendimiento</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
          
          {/* Logo del negocio */}
          <div>
            <label className="block mb-3 font-semibold text-gray-800">Logo del negocio</label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 overflow-hidden hover:border-teal-400 transition">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-teal-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-900
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-teal-50 file:text-teal-700
                      hover:file:bg-teal-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-3">
                    📸 PNG o JPG (recomendado: cuadrado, máx. 2MB)
                  </p>
                  {logoActual && !nuevoLogo && (
                    <p className="text-xs text-teal-600 mt-2">
                      ✓ Usando logo actual
                    </p>
                  )}
                  {nuevoLogo && (
                    <p className="text-xs text-teal-600 mt-2">
                      ✓ Nuevo logo seleccionado
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Nombre del negocio */}
          <div>
            <label htmlFor="nombre" className="block mb-2 font-semibold text-gray-800">
              Nombre del negocio <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border border-gray-300 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              placeholder="Ej: Tienda de Ropa Bella"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block mb-2 font-semibold text-gray-800">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="border border-gray-300 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none"
              rows={4}
              placeholder="Cuenta a tus clientes sobre tu negocio, productos y servicios..."
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block mb-2 font-semibold text-gray-800">WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">+51</span>
              </div>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="border border-gray-300 pl-14 pr-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="987654321"
                pattern="[0-9]{9}"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💬 Los clientes podrán contactarte por WhatsApp
            </p>
          </div>

          {/* Botones */}
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
            
            <Link
              href="/dashboard"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-center flex items-center justify-center gap-2"
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