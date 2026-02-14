"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/app/lib/supabaseBrowser";

export default function EditProductPage() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Cargar datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert("Error cargando producto");
        return;
      }

      setNombre(data.nombre);
      setDescripcion(data.descripcion);
    };

    fetchProduct();
  }, [id, supabase]);

  // 👇 Aquí corregimos el error
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { error } = await supabase
      .from("productos")
      .update({
        nombre,
        descripcion,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error al actualizar producto");
      return;
    }

    alert("Producto actualizado");
    window.location.href = "/dashboard/products";
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Editar producto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border px-3 py-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border px-3 py-2 w-full rounded"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar cambios
        </button>

      </form>
    </div>
  );
}
