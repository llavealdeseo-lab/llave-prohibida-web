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
    deck: z.array(CardSchema).length(8).describe("Array de EXACTAMENTE 8 objetos de carta. 4 con target P1 y 4 con target P2."),
    summary: z.string().describe("Resumen (interno, no mostrado al usuario) de la lógica que usó la IA para armar el mazo."),
});

export async function POST(req) {
    try {
        const { category, p1Desire, p2Desire, p1Score, p2Score } = await req.json();

        if (!category || !p1Desire || !p2Desire || p1Score == null || p2Score == null) {
            return NextResponse.json({ error: 'Faltan datos de sesión o deseos.' }, { status: 400 });
        }
        
        // Regla: El deseo generado debe ser menos intenso (puntaje - 1)
        const maxScoreP1_Deck = p1Score > 1 ? p1Score - 1 : 1; 
        const maxScoreP2_Deck = p2Score > 1 ? p2Score - 1 : 1; 

        const systemPrompt = `
            Eres el motor generador de cartas del juego 'Llave Prohibida'. Tu trabajo es crear EXACTAMENTE 8 cartas adicionales para un mazo de 10.
            Las 8 cartas deben dividirse en 4 para el Jugador 1 (target: P1) y 4 para el Jugador 2 (target: P2).

            ### Contexto de la Sesión:
            - Categoría de la Llave: ${category}.
            - Deseo P1 (Puntaje ${p1Score}): "${p1Desire}" (Máx. intensidad para cartas Target: P2 es ${maxScoreP1_Deck}).
            - Deseo P2 (Puntaje ${p2Score}): "${p2Desire}" (Máx. intensidad para cartas Target: P1 es ${maxScoreP2_Deck}).

            ### Reglas Estrictas de Generación:
            1. **Intensidad (Puntajes):** La intensidad de cada carta debe ser MENOR O IGUAL al puntaje máximo permitido:
                - Las 4 cartas dirigidas a **P1 (target: P1)** deben tener una intensidad (intensity) entre 1 y **${maxScoreP2_Deck}** (basado en P2).
                - Las 4 cartas dirigidas a **P2 (target: P2)** deben tener una intensidad (intensity) entre 1 y **${maxScoreP1_Deck}** (basado en P1).
            2. **Focalización (Perfil):**
                - Las 4 cartas para **Target: P2** deben estar diseñadas para satisfacer el perfil/deseo de P1 ("${p1Desire}").
                - Las 4 cartas para **Target: P1** deben estar diseñadas para satisfacer el perfil/deseo de P2 ("${p2Desire}").
            3. **Temática:** Mantén la temática alineada con la Categoría Base (${category}) pero respetando siempre los límites de intensidad.
            4. **Claridad en la Acción (Redacción):** La descripción debe dejar ABSOLUTAMENTE CLARO quién realiza la acción (el 'Performer') y quién la recibe (el 'Target').
                - Si target es P1, el PERFORMER es P2. La descripción debe empezar con una frase como: "Tú (P2) debes..." o "Debes prepararle... (a P1)".
                - Si target es P2, el PERFORMER es P1. La descripción debe empezar con una frase como: "Tú (P1) debes..." o "Debes hacerle... (a P2)".

            Genera las 8 cartas, asegurando 4 para P1 y 4 para P2, y que el puntaje 'intensity' cumpla las restricciones exactas.
        `;

        const { object } = await generateObject({
            // 🛑 CAMBIO CLAVE: Usamos FLASH para un procesamiento más rápido y menos propenso a timeouts
            model: google("gemini-2.5-flash"), 
            schema: DeckSchema,
            prompt: `Genera las 8 cartas para el mazo. Revisa las 4 cartas para P1 (max ${maxScoreP2_Deck}) y las 4 para P2 (max ${maxScoreP1_Deck}).`,
            system: systemPrompt,
        });
        
        // Verificación de seguridad
        if (!object.deck || object.deck.length !== 8) {
             throw new Error(`La IA no generó el número correcto de cartas (esperado: 8, recibido: ${object.deck ? object.deck.length : 0}).`);
        }

        return NextResponse.json(object);

    } catch (error) {
        // El log ahora tendrá el error de validación o timeout real si ocurre
        console.error("Error al generar mazo de IA (FALLO CRÍTICO):", error);
        return NextResponse.json(
            { deck: [], summary: "Error al generar mazo. Timeout/Parsing failure." },
            { status: 500 }
        );
    }
}