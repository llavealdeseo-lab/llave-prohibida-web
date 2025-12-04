// ESTE CÓDIGO SE EJECUTA EN EL SERVIDOR.
// src/app/api/ia/suggestions/route.js
// Usando la librería AI SDK para generar sugerencias.
// src/app/api/ia/suggestions/route.js
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server"; 

export const runtime = 'edge';

const SuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string().describe("Título corto y atractivo del deseo"),
      description: z.string().describe("Descripción de la dinámica del deseo"),
    })
  ).max(4).min(4),
});

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const category = url.searchParams.get("category");

        if (!category) {
            return NextResponse.json({ message: "Falta parámetro de categoría." }, { status: 400 });
        }
        
        const systemPrompt = `Eres un escritor creativo y sensual que genera ejemplos de deseos para un juego de pareja llamado "Llave Prohibida". 
        El objetivo es inspirar al usuario a escribir su propio deseo en la categoría: ${category}.
        Genera exactamente 4 ejemplos de deseos. Los ejemplos deben ser directos y elegantes, con títulos cortos y descripciones claras.
        SIEMPRE debes responder únicamente con el objeto JSON que cumpla el esquema.`;

        // 🎯 CAMBIO CRÍTICO: Usamos el modelo estable gemini-2.5-flash para generación rápida.
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: SuggestionSchema,
            prompt: `Genera 4 sugerencias de deseos para la categoría ${category}.`,
            system: systemPrompt,
        });

        return NextResponse.json(object);

    } catch (error) {
        console.error("Error al generar sugerencias de IA:", error);
        return NextResponse.json(
            { suggestions: [] },
            { status: 500 }
        );
    }
}