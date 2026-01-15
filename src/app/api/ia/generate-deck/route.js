// src/app/api/ia/generate-deck/route.js
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = 'edge';

// Esquema para la IA que define la estructura del mazo generado
const CardSchema = z.object({
    title: z.string().max(40).describe("Título corto y atrevido del deseo de la carta, en español."),
    // 🛑 CAMBIO CLAVE: Aumentar el límite a 150 para evitar la falla de validación
    description: z.string().max(150).describe("Descripción concisa (MAX 150 CARACTERES) de la acción a realizar, seductora y clara, en español."),
    intensity: z.number().min(1).max(15).describe("Puntaje de intensidad de 1 a 15, siempre MENOR al puntaje máximo permitido."),
    target: z.enum(["P1", "P2"]).describe("A quién beneficia o está dirigido el deseo (Quién recibe la acción): P1 o P2."),
});

const DeckSchema = z.object({
    deck: z.array(CardSchema).length(7).describe("Array de EXACTAMENTE 7 objetos de carta. 4 con target P1 y 3 con target P2."),
    summary: z.string().describe("Resumen (interno, no mostrado al usuario) de la lógica que usó la IA para armar el mazo."),
    narration: z.string().describe("Comentario seductor final sobre el mazo generado."),
});

import { FALLBACK_DECKS } from "../../../../constants/gameCards";

export async function POST(req) {
    const body = await req.json();
    const { category, p1Desire, p2Desire, p1Score, p2Score, p1Profile, p2Profile, p1Name, p2Name } = body;

    try {
        if (!category || !p1Desire || !p2Desire || p1Score == null || p2Score == null) {
            return NextResponse.json({ error: 'Faltan datos de sesión o deseos.' }, { status: 400 });
        }

        // REGLA FUNDAMENTAL: El deseo generado debe ser IGUAL O MENOS intenso que el original
        const maxScore_Generated = Math.min(p1Score, p2Score);

        // Perfil Contextual e Identidad
        const formatProfile = (p) => {
            if (!p) return "Sin perfil";
            return `
            - Género: ${p.gender || 'No especificado'}
            - Dinámica: ${p.dominance || 'Versátil'}
            - Lenguaje: ${p.language || 'Variado'}
            - Osadía: ${p.daring || 'Curiosa'}
            - Prioridad: ${p.cost || 'Balanceado'}`;
        };

        const profileContext = `
            PARTICIPANTES:
            - Jugador 1: ${p1Name || 'P1'} (${formatProfile(p1Profile)})
            - Jugador 2: ${p2Name || 'P2'} (${formatProfile(p2Profile)})
        `;

        const systemPrompt = `
            Eres el 'Maestro de Ceremonias' de Llave Prohibida. 
            Tu objetivo es crear un juego que sea VIRAL en redes sociales por su capacidad de NEGOCIACIÓN EXTREMA.

            ### REGLA DE ORO: IDENTIDAD
            - USA LOS NOMBRES de los jugadores en la descripción de las cartas.
            - Ejemplo: "Pepito debe susurrarle a María..." en vez de "Tú (P1)...".
            - Dale un toque personal y seductor.

            ### EL JUEGO DE LA NEGOCICACIÓN (Game Theory):
            - El juego se basa en: "OK, yo cumplo tu deseo, pero tú debes cumplir el mío o este reto equivalente".
            - Debes generar 7 cartas (4 para P1, 3 para P2) que actúen como "moneda de cambio".
            - Si P1 pidió algo muy osado o caro, las cartas para P2 deben ser RETOS o PETICIONES que equilibren la balanza.

            ### REGLAS TÉCNICAS:
            1. **ANTI-ESPEJO:** Prohibido repetir palabras del deseo del usuario.
            2. **LÍMITE DE INTENSIDAD:** La intensidad (score) DEBE SER <= ${maxScore_Generated}. 
            3. **ESTÉTICA VIRAL:** Títulos cortos y provocadores.
            4. **REGLAS DE ORO (INVIOLABLES):**
               - **SEXO ANAL:** Solo permitido si la intensidad es >= 11 (DESEO PROHIBIDO).
               - **LÍMITES MONETARIOS:** Tentación (<100USD), Pasión (<300USD), Deseo Prohibido (<3000USD). No generes cartas que excedan los límites de la categoría actual (${category}).
               - **KAMASUTRA:** En categorías PASIÓN y DESEO PROHIBIDO, debes incluir al menos 2 cartas que describan posiciones del Kamasutra de forma seductora.
            
            ### Contexto:
            - Categoría: ${category}
            - Deseo ${p1Name || 'P1'}: "${p1Desire}"
            - Deseo ${p2Name || 'P2'}: "${p2Desire}"
            ${profileContext}

            ### Formato: 7 cartas exactas en JSON.
        `;

        const { object } = await generateObject({
            model: google("gemini-1.5-flash"),
            schema: DeckSchema,
            maxTokens: 2000,
            prompt: `Genera las 7 cartas personalizadas para ${p1Name || 'P1'} y ${p2Name || 'P2'}.`,
            system: systemPrompt,
        });

        if (!object.deck || object.deck.length !== 7) {
            throw new Error(`La IA no generó el número correcto de cartas.`);
        }

        return NextResponse.json(object);

    } catch (error) {
        console.error("⚠️ Fallo en IA (Deck), usando respaldo estático:", error);

        const staticCards = FALLBACK_DECKS[category] || FALLBACK_DECKS['PASION'];
        const shuffled = [...staticCards].sort(() => 0.5 - Math.random());

        const p1Cards = shuffled.filter(c => c.target === 'P1').slice(0, 4);
        const p2Cards = shuffled.filter(c => c.target === 'P2').slice(0, 3);
        const finalFallbackDeck = [...p1Cards, ...p2Cards];

        return NextResponse.json({
            deck: finalFallbackDeck,
            summary: "Mazo de emergencia activado por el destino.",
            narration: `La conexión con el más allá es débil, pero no se preocupen, ${p1Name || 'querido'} y ${p2Name || 'dulce'}. El destino ha elegido las cartas por ustedes. No se resistan al ritual.`
        });
    }
}
