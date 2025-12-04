// src/components/AdminLogin.jsx
"use client";

import { useState } from 'react';
import { supabase } from "@/lib/supabaseClient";

/**
 * Componente de formulario de inicio de sesión para el área de administrador.
 */
export default function AdminLogin({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Llama al método de login de Supabase
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Muestra errores específicos, como "Invalid login credentials"
                setError("Acceso denegado: Credenciales inválidas.");
            } else {
                // Si el login es exitoso, la función onLoginSuccess se activará
                // a través del Listener global (que pondremos en page.js).
                // Pero podemos llamarlo directamente para ser redundantes si queremos.
                if(onLoginSuccess) onLoginSuccess();
            }

        } catch (e) {
            setError("Error desconocido al intentar iniciar sesión.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-black text-white">
            <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-yellow-700">
                <h2 className="text-2xl text-yellow-400 font-serif mb-6 border-b border-yellow-800 pb-2">
                    🔑 Acceso al Panel de Control
                </h2>
                
                {error && (
                    <div className="bg-red-900 text-red-300 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-black border border-gray-600 p-3 rounded focus:outline-none focus:border-yellow-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2" htmlFor="password">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-black border border-gray-600 p-3 rounded focus:outline-none focus:border-yellow-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded transition-all disabled:opacity-50"
                >
                    {loading ? "Verificando..." : "Ingresar"}
                </button>
            </form>
        </div>
    );
}