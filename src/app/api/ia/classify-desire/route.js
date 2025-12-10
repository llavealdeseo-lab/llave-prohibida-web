import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis"; 

export const runtime = 'edge';

export async function POST(req) {
    
    // 1. OBTENER LA IP DEL CLIENTE
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'; 

    // 2. APLICAR RATE LIMITING: MÁXIMO 10 PETICIONES EN 86400 SEGUNDOS (1 día)
    const DAILY_LIMIT = 10;
    const DAY_IN_SECONDS = 60 * 60 * 24; // 86400 segundos

    const { success, remaining, reset } = await checkRateLimit(ip, DAILY_LIMIT, DAY_IN_SECONDS);

    if (!success) {
        // Calcular el tiempo de espera restante en horas/minutos
        const timeRemainingMs = reset - Date.now();
        const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1000);
        const hours = Math.floor(timeRemainingSeconds / 3600);
        const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);

        return NextResponse.json({ 
            error: "Límite diario alcanzado.", 
            message: `Has excedido el límite de ${DAILY_LIMIT} clasificaciones por día. Intenta de nuevo en aproximadamente ${hours} horas y ${minutes} minutos.` 
        }, {
            status: 429,
            headers: {
                'X-RateLimit-Limit': DAILY_LIMIT.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': reset.toString(),
            },
        });
    }

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
      model: google("gemini-2.5-flash"),
      schema: z.object({
        score: z.number().min(1).max(15).describe("Puntaje de intensidad calculado del 1 al 15"),
        reasoning: z.string().describe("Breve explicación de por qué se asignó ese puntaje (ej: 'Es un viaje costoso')")
      }),
      prompt: prompt,
    });

   return NextResponse.json(object, {
         headers: {
            'X-RateLimit-Limit': DAILY_LIMIT.toString(),
            'X-RateLimit-Remaining': remaining.toString(), 
            'X-RateLimit-Reset': reset.toString(),
        },
    });

  } catch (error) {
    console.error("Error en clasificación:", error);
    // Fallback de seguridad: devolvemos un puntaje medio si falla
    return NextResponse.json({ score: 7, reasoning: "Error IA" }, { status: 500 });
  }
}