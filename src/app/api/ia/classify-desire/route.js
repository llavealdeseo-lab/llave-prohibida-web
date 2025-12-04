// src/app/api/ia/classify-desire/route.js
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req) {
  try {
    const { desire } = await req.json();

    if (!desire) return NextResponse.json({ error: 'Falta el deseo' }, { status: 400 });

    const prompt = `
      Eres un Juez Clasificador para el juego 'Llave Prohibida'.
      Tu única tarea es analizar la INTENSIDAD de un deseo y asignarle un puntaje numérico del 1 al 15.

      TABLA DE PUNTUACIÓN:
      
      1. TENTACIÓN (Puntaje 1-5):
         - Baja intensidad física/emocional. Regalos baratos (< $100 USD).
         - Ejemplos: Masajes (2), Flores (3), Cita tranquila (4), Besos (1).

      2. PASIÓN (Puntaje 6-10):
         - Intensidad media. Erotismo, Lencería. Regalos medios (< $300 USD).
         - Ejemplos: Cena lujosa (7), Spa (8), Baile erótico (9), Striptease (10).

      3. DESEO PROHIBIDO (Puntaje 11-15):
         - Alta intensidad. Tabúes, Sexo público, Dolor/Placer. Regalos CAROS (< $3000 USD).
         - CRÍTICO: Si implica gastos altos (Viajes, Joyas, Tecnología, iPhone), el puntaje debe ser alto (12-15).
         - Ejemplos: Sexo en público (12), Viaje a Brasil (14), iPhone Nuevo (13), Trío (15).

      Deseo a evaluar: "${desire}"

      Responde solo con el JSON.
    `;

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        score: z.number().min(1).max(15).describe("Puntaje de intensidad calculado del 1 al 15"),
        reasoning: z.string().describe("Breve explicación de por qué se asignó ese puntaje (ej: 'Es un viaje costoso')")
      }),
      prompt: prompt,
    });

    return NextResponse.json(object);

  } catch (error) {
    console.error("Error en clasificación:", error);
    // Fallback de seguridad: devolvemos un puntaje medio si falla
    return NextResponse.json({ score: 7, reasoning: "Error IA" }, { status: 500 });
  }
}