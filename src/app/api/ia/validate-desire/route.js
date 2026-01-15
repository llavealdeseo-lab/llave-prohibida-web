// src/app/api/ia/validate-desire/route.js

// Usando la librería AI SDK que ya tenías instalada.

// src/app/api/ia/validate-desire/route.js

import { google } from "@ai-sdk/google";

import { generateObject } from "ai";

import { z } from "zod";

import { NextResponse } from "next/server";



export const runtime = 'edge';



export async function POST(req) {

  try {

    const { desire, category, p1Name, partnerDesire, userProfile } = await req.json();

    if (!desire || !category) {
      return NextResponse.json({
        isApproved: false,
        isLowerCategory: false,
        message: 'Faltan parámetros de deseo o categoría.'
      }, { status: 400 });
    }

    const genderContext = userProfile?.gender ? `El usuario se identifica como: ${userProfile.gender}.` : "";
    const interestContext = (userProfile?.language === 'gifts' || userProfile?.cost === 'money')
      ? "Al usuario le interesan mucho los regalos y los deseos monetarios o de valor material. Intenta sugerir algo en ese eje si su deseo actual es tibio."
      : "";

    const partnerContext = partnerDesire ? `
        TU PAREJA HA PEDIDO: "${partnerDesire}".
        Si notas que los deseos son muy desparejos, coméntalo en el 'aiWhisper' incitando a equilibrar.
    ` : "Tu pareja aún no ha revelado su deseo.";

    const prompt = `
      Eres el 'Intermediario Perverso' para el juego 'Llave Prohibida'.
      Tu función es CLASIFICAR el deseo de ${p1Name || 'el usuario'} y VALIDARLO contra la categoría ${category}.

      ### CONTEXTO DEL USUARIO:
      ${genderContext}
      ${interestContext}
      ${partnerContext}

      ### REGLAS DE ORO (INVIOLABLES):
      1. **SEXO ANAL**: Pertenece SIEMPRE a la categoría 'DESEO PROHIBIDO' (Intensity 11-15). Nunca lo apruebes en Tentación o Pasión.
      2. **LÍMITES MONETARIOS**:
         - TENTACIÓN: Máximo 100 USD (o equivalente simbólico).
         - PASIÓN: Máximo 300 USD.
         - DESEO PROHIBIDO: Máximo 3,000 USD.
         Si el deseo excede el monto de la categoría actual, debe ser RECHAZADO (isApproved: false).

      ### PERSONALIDAD:
      Eres seductor, observador y manipulador. Devolverás un 'aiWhisper' corto y provocador.
      - Si el perfil muestra interés en regalos ('gifts'/'money'), y el deseo es romántico, sugiere algo de valor material que eleve la apuesta.

      ### CRITERIOS DE CATEGORÍA:
      1. TENTACIÓN: Romántico, suave (Intensity 1-5). < 100 USD.
      2. PASIÓN: Erótico, sensual (Intensity 6-10). < 300 USD.
      3. DESEO PROHIBIDO: Tabú (ej: sexo anal), extremo, alto valor monetario (Intensity 11-15). < 3,000 USD.

      ### INSTRUCCIONES:
      - isApproved: true si el deseo es <= categoría actual.
      - isLowerCategory: true si el deseo es < categoría actual.
    `;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        isApproved: z.boolean(),
        isLowerCategory: z.boolean(),
        message: z.string().describe("Feedback técnico."),
        aiWhisper: z.string().describe("Comentario seductor y perverso de la IA sobre el deseo."),
      }),
      prompt: `Deseo de ${p1Name || 'usuario'}: "${desire}"`,
      system: prompt,
    });



    return NextResponse.json(object);



  } catch (error) {
    // --- INICIO DE LÓGICA DE RESPALDO (FALLBACK) ---
    console.error("⚠️ Error de conexión con IA (Validación), aprobando automáticamente:", error);

    // Si la IA falla, siempre aprobamos el deseo para evitar bloquear al jugador.
    return NextResponse.json(
      {
        isApproved: true,
        isLowerCategory: false,
        message: 'El destino ha aceptado tu deseo. Procede con el ritual.',
        aiWhisper: "Tu deseo brilla con una luz propia, aunque mis ojos estén nublados ahora... me gusta."
      },
      { status: 200 } // Devolver 200 (OK) para que el frontend avance
    );
    // --- FIN DE LÓGICA DE RESPALDO ---
  }
}