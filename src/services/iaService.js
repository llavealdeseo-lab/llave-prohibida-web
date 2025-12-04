

// src/services/iaService.js

// CRÍTICO: Asegurarse de que este archivo inicialice correctamente el cliente de Supabase
import { supabase } from "@/lib/supabaseClient"; 

const IA_API_ROUTE = '/api/ia';

// =========================================================================
// GESTIÓN DE HISTORIAL (Supabase)
// =========================================================================

/**
 * Carga el historial de deseos desde la base de datos Supabase.
 * @returns {object} El historial de deseos en formato {byId: {...}}
 */
async function getDesiresHistory() {
    try {
        const { data, error } = await supabase
            .from('desires_history')
            .select('*')
            .order('count', { ascending: false }); 

        if (error) {
            console.error("Error fetching desires from DB:", error);
            return { byId: {} };
        }
        
        // Mapea la respuesta de la DB al formato esperado por el componente Admin
        const byId = data.reduce((acc, d) => {
            acc[d.id] = {
                id: d.id,
                title: d.title,
                type: d.type,
                // Mapeo de la columna de la DB (intensity_score) a la variable de frontend (intensidad_puntaje)
                intensidad_puntaje: d.intensity_score, 
                count: d.count,
                popular: d.popular,
                status: d.status, // <--- NUEVO: Exponer el Status
            };
            return acc;
        }, {});
        
        return { byId };
    } catch (e) {
        console.error("Error general en getDesiresHistory:", e);
        return { byId: {} }; 
    }
}

/**
 * Guarda o actualiza (UPSERT) un deseo en la base de datos con un status específico.
 * Lógica: 1. Busca si existe. 2. Calcula nuevo 'count'. 3. Inserta o Actualiza.
 * Esto asegura que el campo 'status' y 'count' se actualicen correctamente en la misma función.
 */
async function saveDesireStatus({ desireTitle, desireCategory, score, newStatus }) {
    if (!desireTitle) return console.warn("Cannot save desire without a title.");

    try {
        // 1. Buscar si ya existe un deseo con ese título
        const { data: existingDesire, error: searchError } = await supabase
            .from('desires_history')
            .select('id, count, popular') // Aseguramos traer popular y count
            .eq('title', desireTitle)
            .single();

        if (searchError && searchError.code !== 'PGRST116') { // PGRST116 es 'No rows found', que está bien
            console.error("Error buscando deseo:", searchError);
        }

        const newCount = existingDesire ? existingDesire.count + 1 : 1;
        const popularStatus = existingDesire ? existingDesire.popular : false;

        const dataToSave = {
            title: desireTitle,
            type: desireCategory,
            intensity_score: score,
            popular: popularStatus, // Mantiene la bandera popular si ya existía
            status: newStatus, // El nuevo estado (VALIDATED, REJECTED, CONFIRMED)
            count: newCount, 
        };

        let result;
        if (existingDesire) {
            // 2. Si existe: Actualizar el registro
            result = await supabase
                .from('desires_history')
                .update(dataToSave)
                .eq('id', existingDesire.id);
        } else {
            // 3. Si no existe: Insertar nuevo registro
            result = await supabase
                .from('desires_history')
                .insert(dataToSave);
        }

        if (result.error) {
            console.error(`Error al guardar/actualizar deseo:`, result.error);
            return false;
        }
        return true;

    } catch (e) {
        console.error("Error general en saveDesireStatus:", e);
        return false;
    }
}

/**
 * Marca o desmarca un deseo específico como popular (sugerencia oficial) en la DB.
 */
async function markPopular(title, isPopular) {
    try {
        const { error } = await supabase
            .from('desires_history')
            .update({ popular: isPopular })
            .eq('title', title); 
        
        if (error) {
            console.error("Error marking popular in DB:", error);
        }
    } catch (e) {
        console.error("Error general en markPopular:", e);
    }
}

/**
 * Elimina todo el historial de deseos de la base de datos.
 */
async function clearDesiresHistory() {
    if (typeof window !== 'undefined' && !confirm("CONFIRMAR: ¿Eliminar todos los registros de deseos de la base de datos?")) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('desires_history')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); 
        
        if (error) {
            console.error("Error clearing history in DB:", error);
        }
    } catch (e) {
        console.error("Error general en clearDesiresHistory:", e);
    }
}


// =========================================================================
// FUNCIONES DE INTERACCIÓN CON LA IA (Se mantienen tus llamadas a API)
// =========================================================================

const validateDesire = async (text, category) => {
    try {
        const response = await fetch(`${IA_API_ROUTE}/validate-desire`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ desire: text, category }),
        });

        if (!response.ok) throw new Error(`Error server: ${response.statusText}`);
        // NOTA: Asumimos que el endpoint solo devuelve isApproved, isLowerCategory y message.
        return await response.json(); 
    } catch (error) {
        console.error("Error al validar deseo con IA:", error);
        return { isApproved: false, isLowerCategory: false, message: "❌ Error de conexión con la IA." };
    }
};

/**
 * Prioriza las sugerencias curadas de la DB antes de llamar a la IA.
 */
const getSuggestions = async (category) => {
    try {
        // 1. Obtener las sugerencias curadas del administrador (AHORA ASÍNCRONO DE LA DB)
        const history = await getDesiresHistory();
        const curatedSuggestions = history.byId;
        
        const suggestionsFromAdmin = Object.values(curatedSuggestions)
            .filter(d => d.popular && d.type === category)
            .map(d => ({ 
                title: d.title, 
                description: `Sugerencia popular curada (${d.count} veces).` 
            }));

        if (suggestionsFromAdmin.length >= 3) {
            return suggestionsFromAdmin;
        }

        // 2. Fallback: Llamar a la IA
        const response = await fetch(`${IA_API_ROUTE}/suggestions?category=${category}`);
        if (!response.ok) throw new Error("Error server suggestions");
        
        const result = await response.json();
        const iaSuggestions = (result.suggestions || []).map(s => ({...s, description: s.description || "Generado por IA."}));
        
        return [...suggestionsFromAdmin, ...iaSuggestions].slice(0, 5); 
    } catch (error) {
        console.error("Error al obtener sugerencias (DB/IA):", error);
        return [
             { title: "Deseo de Ejemplo", description: "Fallo de conexión, pero aquí tienes una idea." }
        ]; 
    }
};

const getDesireScore = async (text) => {
    try {
        const response = await fetch(`${IA_API_ROUTE}/classify-desire`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ desire: text }),
        });

        if (!response.ok) throw new Error("Error server classification");
        const result = await response.json();
        return result.score || 8; 
    } catch (error) {
        console.error("Error obteniendo score:", error);
        return 8; 
    }
};

const generateFinalDeck = async (category, p1DesireObject, p2DesireObject) => {
    const p1Desire = p1DesireObject.text || p1DesireObject.desire;
    const p2Desire = p2DesireObject.text || p2DesireObject.desire;

    if (!p1Desire || !p2Desire) {
        throw new Error("Faltan deseos de ambos participantes.");
    }

    let p1Score = p1DesireObject.score || await getDesireScore(p1Desire);
    let p2Score = p2DesireObject.score || await getDesireScore(p2Desire);

    try {
        const response = await fetch(`${IA_API_ROUTE}/generate-deck`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, p1Desire, p2Desire, p1Score, p2Score }),
        });

        if (!response.ok) throw new Error('Error de servidor al generar mazo.');

        const iaResult = await response.json();
        const generatedCards = iaResult.deck || [];
        
        const finalDeck = [
            { isParticipantDesire: true, title: `DESEO DE P1`, description: p1Desire, owner: 'P1', intensity: p1Score },
            { isParticipantDesire: true, title: `DESEO DE P2`, description: p2Desire, owner: 'P2', intensity: p2Score },
            ...generatedCards 
        ];

        // D. MEZCLAR (Shuffle)
        for (let i = finalDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalDeck[i], finalDeck[j]] = [finalDeck[j], finalDeck[i]];
        }
        
        return { deck: finalDeck, summary: iaResult.summary };
    } catch (error) {
        console.error("Error en generateFinalDeck:", error);
        const fallbackDeck = new Array(10).fill({
            title: "Carta del Destino",
            description: "La conexión falló, pero el deseo sigue vivo. Improvisa.",
        });
        return { deck: fallbackDeck, summary: "Error IA" };
    }
};


// =========================================================================
// NUEVA FUNCIÓN: CLASIFICACIÓN PARA MODO EXPLORACIÓN (VENTA)
// =========================================================================

/**
 * Llama al endpoint de clasificación de la IA para obtener la categoría del deseo.
 * Esto se usa en el modo Exploración para dirigir la venta.
 * Devuelve la categoría en el formato (TENTACION, PASION, DESEO_PROHIBIDO).
 */
const classifyDesireForExploration = async (text) => {
    try {
        // Reutilizamos el endpoint que clasifica el deseo.
        // Asumimos que el endpoint /api/ia/classify-desire puede devolver
        // la categoría principal además del score.
        // Si el endpoint solo devuelve el score, DEBEMOS MODIFICAR EL ENDPOINT DEL SERVIDOR.

        const response = await fetch(`${IA_API_ROUTE}/classify-desire`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ desire: text }),
        });

        if (!response.ok) throw new Error("Error server classification");
        const result = await response.json();

        // 🛑 CRÍTICO: Asumimos que el resultado contiene la categoría (Ej: result.category).
        // Si tu backend NO devuelve 'category', deberás modificar el backend o
        // deducir la categoría a partir del 'score'.
        
        // **OPCIÓN IDEAL (Si el backend lo retorna):**
        if (result.category) {
            return result.category.toUpperCase(); // Retorna TENTACION, PASION, etc.
        }

        // **OPCIÓN FALLBACK (Si el backend solo retorna 'score'):**
        // Si el score es la única pista, usamos la siguiente lógica de mapeo.
        const score = result.score || 8; 
        
        if (score >= 12) {
             return 'DESEO_PROHIBIDO';
        } else if (score >= 6) {
             return 'PASION';
        } else {
             return 'TENTACION';
        }

    } catch (error) {
        console.error("Error al clasificar deseo para exploración:", error);
        // Fallback a una categoría neutral en caso de error
        return 'SORPRESA'; 
    }
};


// ==========================================
// EXPORTACIÓN FINAL
// ==========================================
export const iaService = {
    // Funciones de IA y Lógica Principal
    validateDesire,
    getSuggestions,
    getDesireScore,
    generateFinalDeck,
    saveDesireStatus,
    // ⬅️ CRÍTICO: Exportamos la nueva función
    classifyDesireForExploration, 

    // Funciones de Administración (¡Con Supabase!)
    getDesiresHistory,
    markPopular,
    clearDesiresHistory,
};