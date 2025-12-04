// src/data/chocolateData.js
/**
 * Estructura de datos centralizada para las categorías de chocolate,
 * incluyendo colores, límites de intensidad y ejemplos populares
 * (simulando los deseos más pedidos recopilados por la IA).
 * * Basado en la documentación del proyecto (Sección 2.3).
 */

const CHOCOLATE_DATA = {
    // ------------------------------------------------------------------------------------------------------
    // CATEGORÍA: TENTACIÓN (Baja)
    // Caja negra con detalles rojos
    // ------------------------------------------------------------------------------------------------------
    tentacion: {
        id: 'tentacion',
        name: 'Tentación',
        intensity: 1,
        colorClass: 'categoryTentacion',
        description: 'La llave de la tentación es para quienes se atreven a dar el primer paso. Está pensada para despertar el deseo, rompiendo el hielo y encendiendo la chispa inicial. ¡Atrévete a desvelar tus anhelos más dulces!',
        examples: [
            { type: 'Regalo', text: 'Un perfume de hasta USD 100.' },
            { type: 'Emocional', text: '“¿Quieres ser mi novio/a?”' },
            { type: 'Físico', text: 'Un beso apasionado, largo y cargado de intención.' },
        ],
        keywords: ['beso', 'abrazo', 'cita', 'regalo pequeño', 'flores', 'detalle', 'pelicula', 'romántico'],
        nextCategory: 'pasion',
    },

    // ------------------------------------------------------------------------------------------------------
    // CATEGORÍA: PASIÓN (Intermedia)
    // Caja negra con detalles plateados
    // ------------------------------------------------------------------------------------------------------
    pasion: {
        id: 'pasion',
        name: 'Pasión',
        intensity: 2,
        colorClass: 'categoryPasion',
        description: 'La llave de la pasión te invita a explorar la intimidad sin censura. Aquí los juegos son más intensos, las reglas se redefinen y los límites se desdibujan. Siéntete libre para explorar tus fantasías.',
        examples: [
            { type: 'Regalo', text: 'Una cena lujosa en un restaurante exclusivo.' },
            { type: 'Emocional', text: 'Un reto de confianza donde se revele un secreto íntimo.' },
            { type: 'Físico', text: 'Un juego de rol donde uno domine al otro.' },
        ],
        keywords: ['sexo', 'lencería', 'juego erótico', 'reto de confianza', 'cena', 'spa', 'posición', 'rol'],
        nextCategory: 'deseo-prohibido',
    },
    
    // ------------------------------------------------------------------------------------------------------
    // CATEGORÍA: DESEO PROHIBIDO (Alta)
    // Caja negra con detalles dorados
    // ------------------------------------------------------------------------------------------------------
    'deseo-prohibido': {
        id: 'deseo-prohibido',
        name: 'Deseo Prohibido',
        intensity: 3,
        colorClass: 'categoryDeseoProhibido',
        description: 'La llave prohibida es el umbral de lo inexplorado. Esta llave es para quienes desean romper todas las reglas, desafiar tabúes y llevar su conexión a un nivel de absoluta adrenalina y compromiso.',
        examples: [
            { type: 'Regalo', text: 'Un viaje de fin de semana a un destino sorpresa.' },
            { type: 'Emocional', text: 'Un compromiso vital como “casarse” o “tener un bebé”.' },
            { type: 'Físico', text: 'Una fantasía sexual extrema o una actividad tabú.' },
        ],
        keywords: ['látigo', 'público', 'viaje', 'iPhone', 'casamiento', 'bebé', 'extremo', 'tabú'],
        nextCategory: null,
    },
};

// Función de utilidad para obtener datos por ID
export const getChocolateData = (id) => CHOCOLATE_DATA[id] || CHOCOLATE_DATA['tentacion'];

// Función de utilidad para clasificar deseos (lógica IA simplificada)
export const classifyDesire = (desire) => {
    desire = desire.toLowerCase();

    // Priorizar Pasión o Deseo Prohibido si tienen la palabra clave más intensa
    if (CHOCOLATE_DATA['deseo-prohibido'].keywords.some(k => desire.includes(k))) {
        return { category: 'deseo-prohibido', intensity: 3 };
    }
    if (CHOCOLATE_DATA['pasion'].keywords.some(k => desire.includes(k))) {
        return { category: 'pasion', intensity: 2 };
    }
    // Por defecto, o si coincide con palabras de Tentación
    return { category: 'tentacion', intensity: 1 };
};

export default CHOCOLATE_DATA;