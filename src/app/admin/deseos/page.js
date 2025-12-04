// src/app/admin/deseos/page.js
// src/app/admin/deseos/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
// Solo mantenemos la referencia a iaService
import { iaService } from "@/services/iaService"; 

const ADMIN_PASSWORD = "llaveadmin2025"; 

export default function DeseosAdmin() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(false); 
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Estados para la data
  const [history, setHistory] = useState([]); 
  const [topDeseos, setTopDeseos] = useState({}); 
  const [metrics, setMetrics] = useState(null); 

  const CATEGORIES = ['TENTACION', 'PASION', 'DESEO_PROHIBIDO'];


  // ============================================================
  // 1. AUTORIZACIÓN (Formulario)
  // ============================================================
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Uso de setTimeout para simular una verificación de clave asíncrona y no bloquear la UI
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setAuthorized(true);
        setFeedback("✅ Sesión de administrador iniciada. Cargando datos...");
      } else {
        setFeedback("❌ Contraseña incorrecta.");
      }
      setPassword("");
      setLoading(false);
    }, 300);
  };

  // ============================================================
  // 2. CARGAR HISTORIAL (FIX: AWAIT en la carga)
  // ============================================================
  useEffect(() => {
    if (authorized) loadHistory();
  }, [authorized]);

  // CRÍTICO: La función debe ser async y await iaService.getDesiresHistory()
  const loadHistory = async () => { 
    setLoading(true);
    setFeedback("Cargando y analizando datos...");
    try {
      const raw = await iaService.getDesiresHistory(); // <-- FIX: Usar await

      const arr =
        raw && raw.byId && typeof raw.byId === "object"
          ? Object.values(raw.byId)
          : [];

      // --- ANÁLISIS DE FRECUENCIA Y AGRUPACIÓN (Curación) ---
      const grouped = {};
      const topN = 5; 

      // --- CÁLCULO DE MÉTRICAS CLAVE (Business Intelligence) ---
      const totalDesires = arr.length;
      let totalIntensitySum = 0;
      const categoryCounts = { TENTACION: 0, PASION: 0, DESEO_PROHIBIDO: 0 };
      const categoryIntensitySums = { TENTACION: 0, PASION: 0, DESEO_PROHIBIDO: 0 };

      // 1. Inicializar Agrupación
      CATEGORIES.forEach(cat => {
          const categoryDeseos = arr
              .filter(d => d.type === cat)
              .sort((a, b) => b.count - a.count); 
          
          grouped[cat] = {
              top: categoryDeseos.slice(0, topN), 
              populars: categoryDeseos.filter(d => d.popular) 
          };
      });

      // 2. Calcular Sumas y Contadores
      arr.forEach(d => {
          totalIntensitySum += (d.intensidad_puntaje || 0);

          if (categoryCounts.hasOwnProperty(d.type)) {
              categoryCounts[d.type]++;
              categoryIntensitySums[d.type] += (d.intensidad_puntaje || 0);
          }
      });

      // 3. Cálculo de Promedios y Tasas
      const repetitiveDesiresCount = arr.filter(d => d.count > 1).length;
      const tasaRepeticion = totalDesires > 0 ? (repetitiveDesiresCount / totalDesires) * 100 : 0;
      const promedioIntensidadGlobal = totalDesires > 0 ? totalIntensitySum / totalDesires : 0;
      
      const categoryAverages = {};
      CATEGORIES.forEach(cat => {
          categoryAverages[cat] = categoryCounts[cat] > 0 
              ? (categoryIntensitySums[cat] / categoryCounts[cat]).toFixed(2) // 2 decimales
              : 0;
      });

      setMetrics({
          totalDesires,
          tasaRepeticion: tasaRepeticion.toFixed(2), // 2 decimales
          promedioIntensidadGlobal: promedioIntensidadGlobal.toFixed(2), // 2 decimales
          categoryCounts,
          categoryAverages,
      });
      setHistory(arr);
      setTopDeseos(grouped);
      setFeedback("✅ Datos cargados y analizados correctamente.");
    } catch (error) {
      setFeedback("❌ Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 3. HANDLERS (FIX: Asíncronos y await para recargar)
  // ============================================================
  
  // CRÍTICO: Debe ser async y esperar tanto a markPopular como a loadHistory
  const handleTogglePopular = async (title, isCurrentlyPopular) => {
    setLoading(true);
    setFeedback(`Actualizando "${title}"...`);
    try {
      await iaService.markPopular(title, !isCurrentlyPopular); // <-- FIX: Usar await
      await loadHistory(); // <-- FIX: Usar await para esperar la recarga
      setFeedback(`✅ Estado de "${title}" actualizado.`);
    } catch (error) {
      setFeedback(`❌ Error al actualizar "${title}".`);
      setLoading(false);
    }
  };

  // CRÍTICO: Debe ser async y esperar tanto a clearDesiresHistory como a loadHistory
  const handleClear = async () => {
    if (!confirm("⚠️ ¿Eliminar TODO el historial de deseos? ¡Esta acción es irreversible!")) return;
    
    setLoading(true);
    setFeedback("Limpiando historial...");
    try {
      await iaService.clearDesiresHistory(); // <-- FIX: Usar await
      await loadHistory(); // <-- FIX: Usar await para esperar la recarga
      setFeedback("🗑️ Historial de deseos eliminado y recargado.");
    } catch (error) {
      setFeedback("❌ Error al limpiar el historial.");
      setLoading(false);
    }
  };

  // ... (handleExportCsv queda igual)
  const handleExportCsv = () => {
    if (!history.length) {
        alert("No hay datos para exportar.");
        return;
    }

    const headers = ["ID", "Título", "Categoría", "Intensidad", "Veces Repetido", "Sugerencia"];
    
    const csvRows = history.map(d => [
        d.id,
        `"${String(d.title || "").replace(/"/g, '""')}"`, 
        d.type,
        d.intensidad_puntaje,
        d.count,
        d.popular ? "Sí" : "No"
    ].join(','));

    const csvContent = [
        headers.join(','),
        ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `deseos_llave_prohibida_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filtered = useMemo(() => {
    return history
      .filter((d) => 
          (filterCategory === "ALL" || d.type === filterCategory) && 
          (d.title || "").toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.count - a.count);
  }, [history, filterCategory, search]);
 

  // ============================================================
  // RENDER
  // ============================================================

  // Render del Formulario de Login
  if (!authorized) { 
    return (
        <main className="p-8 min-h-screen bg-black text-white font-sans flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg border border-yellow-700 w-full max-w-md">
                <h1 className="text-2xl mb-6 text-yellow-400 font-serif text-center">
                    🔒 Acceso a Centro de Inteligencia
                </h1>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <p className="text-gray-400">Ingresa la contraseña de administrador:</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 rounded text-black bg-gray-700 border border-gray-600 focus:border-yellow-400 focus:ring focus:ring-yellow-400/50"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="bg-yellow-600 text-black font-bold p-3 rounded hover:bg-yellow-500 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Verificando...' : 'ACCEDER'}
                    </button>
                    {feedback && <p className={`text-sm mt-2 ${feedback.startsWith('❌') ? 'text-red-400' : feedback.includes('iniciada') ? 'text-green-400' : 'text-gray-400'}`}>{feedback}</p>}
                </form>
            </div>
        </main>
    );
  }


  return (
    <main className="p-8 min-h-screen bg-black text-white font-sans">
      <h1 className="text-3xl mb-6 text-yellow-400 font-serif border-b border-yellow-800 pb-4">
        📊 Centro de Inteligencia de Deseos
      </h1>

      {loading && <p className="text-yellow-500 mb-4">Cargando y analizando datos...</p>}

      {/* Feedback de acciones */}
      {feedback && !loading && (
        <p className={`text-sm mb-4 ${feedback.startsWith('❌') ? 'text-red-400' : 'text-green-400'}`}>
          {feedback}
        </p>
      )}
      
      {/* -------------------------------------------------------- */}
      {/* A. DASHBOARD DE MÉTRICAS CLAVE                           */}
      {/* -------------------------------------------------------- */}
      {metrics && (
        <div className="bg-gray-800 p-6 rounded-lg border border-yellow-700 mb-8">
            <h2 className="text-xl text-yellow-400 mb-4 border-b border-yellow-900 pb-2">🚀 Métricas Clave de Audiencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Métrica 1: Total de Deseos */}
                <div className="bg-gray-900 p-3 rounded-md border-l-4 border-yellow-400">
                    <p className="text-xs text-gray-400">Total Deseos Únicos</p>
                    <p className="text-2xl font-bold">{metrics.totalDesires}</p>
                </div>
                
                {/* Métrica 2: Tasa de Repetición */}
                <div className="bg-gray-900 p-3 rounded-md border-l-4 border-blue-400">
                    <p className="text-xs text-gray-400">Tasa de Deseos Repetidos</p>
                    <p className="text-2xl font-bold">{metrics.tasaRepeticion}%</p>
                </div>

                {/* Métrica 3: Intensidad Promedio Global */}
                <div className="bg-gray-900 p-3 rounded-md border-l-4 border-red-400">
                    <p className="text-xs text-gray-400">Intensidad Prom. Global</p>
                    <p className="text-2xl font-bold">{metrics.promedioIntensidadGlobal}</p>
                </div>
                
                {/* Métrica 4: Promedio por Categoría y Distribución */}
                <div className="bg-gray-900 p-3 rounded-md border-l-4 border-green-400">
                    <p className="text-xs text-gray-400">Análisis por Categoría (Prom. / Total)</p>
                    <div className="text-sm space-y-1 mt-1">
                        {CATEGORIES.map(cat => (
                            <p key={cat}>
                                <span className="font-bold">{cat}:</span> {metrics.categoryAverages[cat]} / {metrics.categoryCounts[cat]}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* B. CURACIÓN DE DESEOS POPULARES (Feed para el usuario)   */}
      {/* -------------------------------------------------------- */}
      <div className="bg-gray-900 p-6 rounded-lg border border-yellow-700 mb-8">
          <h2 className="text-xl text-yellow-400 mb-4">✨ Curación de Sugerencias Oficiales</h2>
          <p className="text-sm text-gray-400 mb-4">
              Revise los deseos más pedidos. Marque como 'Sugerencia' para que aparezcan en la aplicación y sean fáciles de elegir por los usuarios.
          </p>

          <div className="flex gap-4 overflow-x-auto pb-4">
              {CATEGORIES.map(cat => (
                  <div key={cat} className="min-w-[300px] border border-gray-700 p-3 rounded-md bg-gray-800">
                      <h3 className={`font-bold mb-3 text-center ${cat === 'TENTACION' ? 'text-pink-400' : cat === 'PASION' ? 'text-gray-300' : 'text-yellow-400'}`}>
                          {cat}
                      </h3>
                      <ul className="space-y-2">
                          {(topDeseos[cat]?.top || []).map((d, i) => (
                              <li key={i} className={`flex justify-between items-center p-2 rounded 
                                  ${d.popular ? 'bg-green-900/50 border border-green-700' : 'hover:bg-gray-700'}
                              `}>
                                  <span className="text-sm max-w-[60%] overflow-hidden whitespace-nowrap text-ellipsis">
                                      {d.title} ({d.count} VECES)
                                  </span>
                                  <button
                                      onClick={() => handleTogglePopular(d.title, d.popular)}
                                      className={`text-xs px-2 py-1 rounded transition-colors
                                          ${d.popular ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}
                                      `}
                                      disabled={loading}
                                  >
                                      {d.popular ? '❌ Quitar' : '✅ Marcar Sugerencia'}
                                  </button>
                              </li>
                          ))}
                           {(topDeseos[cat]?.top || []).length === 0 && <p className="text-gray-500 text-center text-sm">No hay deseos suficientes para curar.</p>}
                      </ul>
                  </div>
              ))}
          </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* C. VISIÓN GENERAL E HISTORIAL COMPLETO                   */}
      {/* -------------------------------------------------------- */}

      <h2 className="text-xl text-yellow-400 mb-4">📋 Historial Completo de Deseos Procesados</h2>

      <div className="mb-6 flex gap-3 items-center flex-wrap">
        <input
          type="text"
          placeholder="Buscar deseo..."
          className="px-3 py-2 rounded text-black w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select
             className="bg-gray-800 border border-gray-600 text-white p-2 rounded"
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
        >
             <option value="ALL">Todas las Categorías</option>
             {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <button
          onClick={loadHistory}
          className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
          disabled={loading}
        >
          {loading ? 'Refrescando...' : 'Refrescar'}
        </button>
        
        <button
          onClick={handleExportCsv}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
          disabled={loading}
        >
          Exportar CSV
        </button>

        <span className="ml-auto text-sm text-gray-500">Mostrando {filtered.length} deseos</span>

        <button
          onClick={handleClear}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
          disabled={loading}
        >
          Limpiar histórico
        </button>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-yellow-800">
          <thead>
            <tr className="bg-yellow-900 text-yellow-200">
              <th className="p-3">Título</th>
              <th className="p-3">Categoría</th>
              <th className="p-3 text-center">Intensidad</th>
              <th className="p-3 text-center">Veces repetido</th>
              <th className="p-3 text-center">Sugerencia</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-yellow-800 hover:bg-gray-900">
                <td className="p-3 max-w-xs overflow-hidden text-ellipsis">{d.title}</td>
                <td className="p-3 text-yellow-400">{d.type}</td>
                <td className="p-3 text-center">{d.intensidad_puntaje}</td>
                <td className="p-3 text-center font-bold">{d.count}</td>

                <td className={`p-3 text-center ${d.popular ? "text-green-400" : "text-gray-500"}`}>
                  {d.popular ? "Sí" : "No"}
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => handleTogglePopular(d.title, d.popular)}
                    className="bg-blue-700 text-white text-xs px-3 py-1 rounded hover:bg-blue-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    {d.popular ? 'Quitar Marca' : 'Marcar Sugerencia'}
                  </button>
                </td>
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  No hay deseos que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------------------------- */}
      {/* D. FUNCIÓN FUTURA: Deseos Rechazados (Recordatorio)      */}
      {/* -------------------------------------------------------- */}
      <div className="mt-8 p-4 border border-red-900 bg-red-900/20 rounded-lg">
          <h3 className="text-lg text-red-400 mb-2">🔴 Revisión de Deseos No Validados (Pendiente)</h3>
          <p className="text-sm text-gray-300">
              Esta sección es crucial para ver qué **deseos reales** la IA rechaza. Necesitamos actualizar el `iaService` para guardar y exponer estos datos.
          </p>
      </div>
    </main>
  );
}