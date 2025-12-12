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

    const { desire, category } = await req.json();



    if (!desire || !category) {

        return NextResponse.json({ 

            isApproved: false, 

            isLowerCategory: false, 

            message: 'Faltan parámetros de deseo o categoría.' 

        }, { status: 400 });

    }



    const prompt = `

      Eres un Juez de Deseos para el juego 'Llave Prohibida'. Tu única función es CLASIFICAR el deseo del usuario en la categoría real (Tentación, Pasión o Deseo Prohibido) y VALIDARLO estrictamente contra su llave actual (${category}).

      

      Criterios de Clasificación (Intensidad, Valor Monetario y Carga Emocional):

      

      1. TENTACIÓN (Intensidad 1-5): Deseos suaves, románticos. Regalos pequeños (≤ USD 100). EJEMPLOS CLAVE: Abrazos, citas tranquilas, regalos pequeños.

      

      2. PASIÓN (Intensidad 6-10): Deseos eróticos, juegos íntimos. Regalos medianos (≤ USD 300). EJEMPLOS CLAVE: Cena lujosa, baile erótico, spa.

      

      3. DESEO PROHIBIDO (Intensidad 11-15): Deseos extremos, tabúes sexuales, compromisos vitales o regalos de MUY ALTO valor (≤ USD 3000). EJEMPLOS CLAVE: Sexo en público, azotes con látigo, pedir casamiento, VIAJES CAROS (como UN VIAJE A BRASIL).

      

      Tu llave actual es: ${category}.

      

      Instrucciones de Validación:

      1. CLASIFICA el deseo en la categoría real (Tentación, Pasión o Prohibido) según los CRITERIOS y EJEMPLOS de arriba.

      2. Si el deseo es de una categoría superior a tu llave actual: Recházalo (isApproved: false). El mensaje debe ser: "Tu deseo es más osado que tu llave actual. Te sugiero probar un chocolate Deseo Prohibido."

      3. Si el deseo es de la misma categoría que tu llave actual: Acéptalo (isApproved: true, isLowerCategory: false).

      4. Si el deseo es de una categoría inferior a tu llave actual: Acéptalo (isApproved: true), pero marca isLowerCategory: true. El mensaje debe ser: "Tu deseo es válido, pero podrías pedir algo más osado para aprovechar tu llave."

      

      Deseo del Usuario: "${desire}"

      

      Responde ÚNICAMENTE con el objeto JSON. No añadas texto explicativo.

    `;



    const { object } = await generateObject({

      model: google("gemini-2.5-flash"),

      schema: z.object({

        isApproved: z.boolean(),

        isLowerCategory: z.boolean(),

        message: z.string().describe("Feedback corto para el usuario en español, tono seductor pero claro, basado en la instrucción de validación."),

      }),

      prompt: prompt,

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
            message: 'El destino ha aceptado tu deseo. Procede con el ritual.' 
        }, 
        { status: 200 } // Devolver 200 (OK) para que el frontend avance
    );
    // --- FIN DE LÓGICA DE RESPALDO ---
  }
}