// llave-prohibida/data/categoriesData.js

export const CATEGORIES = {
    TENTACION: 'TENTACION',
    PASION: 'PASION',
    DESEO_PROHIBIDO: 'DESEO_PROHIBIDO',
    USED: 'USADA', // Añadido para manejo de QR bloqueado
};

// Mapeo de prefijos para simulación de QR (TE-5678)
export const CATEGORY_PREFIXES = {
    'TE': CATEGORIES.TENTACION,
    'PA': CATEGORIES.PASION,
    'DP': CATEGORIES.DESEO_PROHIBIDO,
    'USADA': CATEGORIES.USED,
};

export const CATEGORY_DESCRIPTIONS = {
    [CATEGORIES.TENTACION]: {
        title: "Tentación (Suave)",
        intensity: 1, // CRÍTICO: Necesario para la validación de IA
        limit: "100 USD",
        examples: [
            "Un masaje de cuerpo completo de 45 minutos.",
            "Una tarde de juegos de mesa con el perdedor quitándose una prenda.",
            "Una noche de besos y caricias sin llegar al acto.",
        ],
    },
    [CATEGORIES.PASION]: {
        title: "Pasión (Intenso)",
        intensity: 2, // CRÍTICO: Necesario para la validación de IA
        limit: "300 USD",
        examples: [
            "Una sesión de bondage ligero y exploratorio.",
            "Usar un antifaz durante toda la noche de pasión.",
            "Intercambio de roles: la pareja dominante cede el control por 24 horas.",
        ],
    },
    [CATEGORIES.DESEO_PROHIBIDO]: {
        title: "Deseo Prohibido (Extremo)",
        intensity: 3, // CRÍTICO: Necesario para la validación de IA
        limit: "3000 USD",
        examples: [
            "Un viaje de fin de semana a una ciudad cercana.",
            "Grabar un video erótico privado que nunca se compartirá.",
            "Un trío o la integración de un juguete sexual nuevo.",
        ],
    },
    [CATEGORIES.USED]: {
        title: "USADA",
        intensity: 0,
        action: "ya ha cumplido su ritual."
    }
};