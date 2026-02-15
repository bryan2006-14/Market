"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabaseBrowser";
import Link from "next/link";

export default function NewProductPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert("Debes iniciar sesión para crear productos");
        setUploading(false);
        return;
      }

      const { data: negocio, error: negocioError } = await supabase
        .from("negocios")
        .select("id")
        .eq("usuario_id", user.id)
        .single();

      if (negocioError || !negocio) {
        alert("Primero debes crear un negocio");
        setUploading(false);
        return;
      }

      let imagen_url = null;
      if (imagen) {
        imagen_url = await uploadImage(imagen);
        if (!imagen_url) {
          alert("Error al subir la imagen");
          setUploading(false);
          return;
        }
      }

      const { error } = await supabase.from("productos").insert({
        nombre,
        descripcion: descripcion || null,
        precio: parseFloat(precio),
        stock: stock ? parseInt(stock) : null,
        imagen_url,
        negocio_id: negocio.id,
        usuario_id: user.id,
      });

      if (error) {
        console.error(error);
        alert("Error al crear producto: " + error.message);
        setUploading(false);
        return;
      }

      alert("✅ Producto creado exitosamente");
      window.location.href = "/dashboard/products";
    } catch (error) {
      console.error("Error general:", error);
      alert("Error inesperado al crear producto");
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #d1fae5, #99f6e4)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/dashboard"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              color: '#059669', 
              fontWeight: '500',
              marginBottom: '1rem',
              textDecoration: 'none'
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Nuevo Producto
          </h1>
          <p style={{ color: '#4b5563' }}>
            Completa los datos de tu nuevo producto
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '2rem' }}>
          
          {/* Imagen del producto */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
              Imagen del producto
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ 
                width: '10rem', 
                height: '10rem', 
                border: '2px dashed #d1d5db', 
                borderRadius: '0.75rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f9fafb',
                overflow: 'hidden'
              }}>
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                    <svg style={{ width: '4rem', height: '4rem', margin: '0 auto 0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p style={{ fontSize: '0.875rem' }}>Sin imagen</p>
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ border: '2px dashed #d1d5db', borderRadius: '0.75rem', padding: '1.5rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'block', width: '100%', fontSize: '0.875rem', cursor: 'pointer' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                    📸 PNG, JPG o WEBP (máx. 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' }}></div>

          {/* Nombre */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="nombre" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
              Nombre del producto <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ 
                border: '1px solid #d1d5db', 
                padding: '0.75rem 1rem', 
                width: '100%', 
                borderRadius: '0.5rem',
                fontSize: '1rem',
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
              placeholder="Ej: Zapatillas deportivas Nike"
              required
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="descripcion" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ 
                border: '1px solid #d1d5db', 
                padding: '0.75rem 1rem', 
                width: '100%', 
                borderRadius: '0.5rem',
                fontSize: '1rem',
                color: '#000000',
                backgroundColor: '#ffffff',
                resize: 'none'
              }}
              rows={4}
              placeholder="Describe tu producto, características, materiales, etc."
            />
          </div>

          {/* Precio y Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Precio */}
            <div>
              <label htmlFor="precio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
                Precio (S/) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  S/
                </span>
                <input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  style={{ 
                    border: '1px solid #d1d5db', 
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    width: '100%', 
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    color: '#000000',
                    backgroundColor: '#ffffff'
                  }}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
                Stock (opcional)
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={{ 
                  border: '1px solid #d1d5db', 
                  padding: '0.75rem 1rem', 
                  width: '100%', 
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
                placeholder="Cantidad"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Deja en blanco si no manejas inventario
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}></div>

          {/* Botones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={uploading}
              style={{ 
                flex: 1,
                background: uploading ? '#9ca3af' : '#059669',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem'
              }}
            >
              {uploading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Crear Producto
                </>
              )}
            </button>
            
            <Link
              href="/dashboard/products"
              style={{ 
                padding: '0.75rem 1.5rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                fontSize: '1rem'
              }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}