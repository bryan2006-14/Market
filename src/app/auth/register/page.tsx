"use client";

import { supabase } from "@/app/lib/supabaseClient";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return setError(error.message);

    setSuccess("Cuenta creada. Revisa tu correo para confirmar.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Crear cuenta</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <input
          type="email"
          placeholder="Correo"
          className="border w-full p-2 rounded mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border w-full p-2 rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Registrarse
        </button>

        <p className="text-center text-sm mt-3">
          ¿Ya tienes cuenta?{" "}
          <a
            className="text-blue-600 underline"
            href="/auth/login"
          >
            Iniciar sesión
          </a>
        </p>
      </form>
    </div>
  );
}
