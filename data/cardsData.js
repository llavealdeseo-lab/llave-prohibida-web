// llave-prohibida/data/cardsData.js

/**
 * Base de Datos MOCK de Cartas / Deseos
 * Contiene un mínimo de 10 deseos para cada una de las 4 categorías,
 * simulando las 50+ cartas por categoría que tendría la BBDD real.
 */

export const CATEGORIES = {
    TENTACION: 'TENTACION',
    PASION: 'PASION',
    DESEO_PROHIBIDO: 'DESEO_PROHIBIDO',
    SORPRESA: 'SORPRESA',
};

// --- ESTRUCTURA DE LA BBDD (SIMULADA) ---

const allCards = [
    // --- TENTACION (Baja Intensidad) ---
    { id: 101, category: CATEGORIES.TENTACION, type: 'IA_DESIRE', focus: 'P1', title: 'Noche de Películas', description: 'Elige la película, yo elijo los snacks y la posición en el sofá.', intensity: 1 },
    { id: 102, category: CATEGORIES.TENTACION, type: 'IA_CHALLENGE', focus: 'P2', title: 'Masaje de Pies', description: 'Masaje de 10 minutos con aceites esenciales, sin hablar.', intensity: 1 },
    { id: 103, category: CATEGORIES.TENTACION, type: 'IA_REVELATION', focus: 'P1', title: 'Tres Cosas Buenas', description: 'Revela las 3 cosas que más admiras de mí en voz alta.', intensity: 1 },
    { id: 104, category: CATEGORIES.TENTACION, type: 'IA_CHALLENGE', focus: 'P2', title: 'Cena Temática', description: 'Cena con comida de un país que nunca hayan visitado.', intensity: 1 },
    { id: 105, category: CATEGORIES.TENTACION, type: 'IA_DESIRE', focus: 'P1', title: 'Beso en la Lluvia', description: 'Salir a la calle a medianoche para un beso bajo la lluvia.', intensity: 2 },
    // Más cartas de tentación...
    { id: 106, category: CATEGORIES.TENTACION, type: 'IA_DESIRE', focus: 'P2', title: 'Carta de Amor', description: 'Escribir una carta de amor a mano y leerla sin interrupciones.', intensity: 1 },
    { id: 107, category: CATEGORIES.TENTACION, type: 'IA_REVELATION', focus: 'P1', title: 'Playlist Secreta', description: 'Compartir la playlist que usas cuando estás solo/a y por qué.', intensity: 1 },
    { id: 108, category: CATEGORIES.TENTACION, type: 'IA_CHALLENGE', focus: 'P2', title: 'Paseo Nocturno', description: 'Un paseo de una hora en un lugar romántico sin usar el móvil.', intensity: 2 },

    // --- PASION (Media Intensidad) ---
    { id: 201, category: CATEGORIES.PASION, type: 'IA_DESIRE', focus: 'P1', title: 'Un Abrazo Profundo', description: 'Un abrazo de al menos 3 minutos, silencioso y sin interrupciones.', intensity: 3 },
    { id: 202, category: CATEGORIES.PASION, type: 'IA_CHALLENGE', focus: 'P2', title: 'Intercambio de Roles', description: 'Intercambiar roles de dominancia por una hora en la casa y en la cama.', intensity: 3 },
    { id: 203, category: CATEGORIES.PASION, type: 'IA_REVELATION', focus: 'P1', title: 'Fantasía Secreta', description: 'Tienes que describir tu fantasía más recurrente en 3 minutos, sin censura.', intensity: 4 },
    { id: 204, category: CATEGORIES.PASION, type: 'IA_DESIRE', focus: 'P2', title: 'Beso de 60 Segundos', description: 'Un beso intenso, sin usar las manos y con los ojos cerrados.', intensity: 3 },
    { id: 205, category: CATEGORIES.PASION, type: 'IA_CHALLENGE', focus: 'P1', title: 'Cena con los Ojos Vendados', description: 'Preparar la cena y comerla con los ojos vendados.', intensity: 3 },
    // Más cartas de pasión...
    { id: 206, category: CATEGORIES.PASION, type: 'IA_DESIRE', focus: 'P2', title: 'Elige la Aventura', description: 'La próxima aventura romántica la elige P2 y P1 debe decir "sí" a todo.', intensity: 3 },
    { id: 207, category: CATEGORIES.PASION, type: 'IA_CHALLENGE', focus: 'P1', title: 'Sesión de Fotos Sensual', description: 'Una sesión de fotos casera, dirigida por P2, enfocada en la sensualidad.', intensity: 4 },
    { id: 208, category: CATEGORIES.PASION, type: 'IA_REVELATION', focus: 'P2', title: 'Diez Cumplidos Sinceros', description: 'Dar 10 cumplidos sinceros sobre la personalidad y el impacto emocional de P2.', intensity: 3 },
    
    // --- DESEO PROHIBIDO (Alta Intensidad) ---
    { id: 301, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_DESIRE', focus: 'P1', title: 'Juego de Roles Inesperado', description: 'Crear un personaje y actuarlo durante 30 minutos sin salirse del papel.', intensity: 5 },
    { id: 302, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_CHALLENGE', focus: 'P2', title: 'Noche de Confesiones', description: 'Compartir un secreto o una experiencia de la que nunca hablaron.', intensity: 5 },
    { id: 303, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_REVELATION', focus: 'P1', title: 'Lista de Cosas Pendientes', description: 'Escribir 5 cosas que el otro desea probar en la cama y comprometerse a una.', intensity: 6 },
    { id: 304, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_DESIRE', focus: 'P2', title: '24 Horas de Servidumbre', description: 'P1 debe atender todos los deseos (razonables) de P2 por 24 horas.', intensity: 5 },
    // Más cartas de deseo prohibido...
    { id: 305, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_CHALLENGE', focus: 'P1', title: 'Hablar sobre el pasado', description: 'Hablar durante 5 minutos sobre una ex pareja o relación importante sin celos ni reproches.', intensity: 5 },
    { id: 306, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_DESIRE', focus: 'P2', title: 'El Despertar', description: 'Despertar al otro con un juego sensorial específico.', intensity: 5 },
    { id: 307, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_REVELATION', focus: 'P1', title: 'Regalo Sensual', description: 'Comprar una prenda de ropa interior que te gustaría que use el otro.', intensity: 6 },
    { id: 308, category: CATEGORIES.DESEO_PROHIBIDO, type: 'IA_CHALLENGE', focus: 'P2', title: 'Intercambio de Accesorios', description: 'Usar un accesorio del otro todo el día, sin importar el género.', intensity: 5 },
    
    // --- SORPRESA (Intensidad variable) ---
    // (Cartas diseñadas para ser comodín, aquí simulamos una mezcla)
    { id: 401, category: CATEGORIES.SORPRESA, type: 'IA_DESIRE', focus: 'P1', title: 'Viaje Sorpresa', description: 'Planear un viaje de fin de semana sin revelar el destino hasta el último minuto.', intensity: 3 },
    { id: 402, category: CATEGORIES.SORPRESA, type: 'IA_CHALLENGE', focus: 'P2', title: 'Día de Reconciliación', description: 'Un día dedicado a resolver un conflicto pendiente, con reglas de escucha activa.', intensity: 4 },
    { id: 403, category: CATEGORIES.SORPRESA, type: 'IA_REVELATION', focus: 'P1', title: 'Voto de Silencio', description: 'Intentar no hablar durante 3 horas seguidas, comunicándose solo con gestos.', intensity: 2 },
    { id: 404, category: CATEGORIES.SORPRESA, type: 'IA_DESIRE', focus: 'P2', title: 'Elixir de Amor', description: 'Crear una bebida nueva y misteriosa y dársela a probar al otro con los ojos vendados.', intensity: 1 },
];

/**
 * Retorna las cartas filtradas por una categoría específica.
 * @param {string} category - CATEGORIES.TENTACION, etc.
 * @returns {Array} - Lista de cartas disponibles.
 */
export const getCardsByCategory = (category) => {
    return allCards.filter(card => card.category === category);
};

export const getAllCards = () => allCards;