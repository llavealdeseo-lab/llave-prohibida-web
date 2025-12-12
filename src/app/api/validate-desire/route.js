import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const runtime = 'edge'; // Hace que la respuesta sea rapidísima

export async function POST(req) {
  try {
    const { desire, category } = await req.json();

    if (!desire) return new Response('Falta el deseo', { status: 400 });

    // Prompt del sistema: Le enseñamos a Gemini las reglas de intensidad
    const prompt = `
      Eres un juez de un juego erótico para parejas llamado 'Llave Prohibida'.
      Tu trabajo es validar si un deseo cumple con la intensidad de la categoría comprada.
      
      Categoría Actual: ${category}
      
      Reglas de Intensidad:
      - TENTACION: Romántico, suave, citas, masajes, besos. (Baja intensidad).
      - PASION: Erótico, lencería, juegos de rol suaves, algo de picardía. (Media intensidad).
      - DESEO_PROHIBIDO: Tabúes, fantasías fuertes, disfraces atrevidos, lugares públicos. (Alta intensidad).
      
      Instrucción:
      Analiza el deseo del usuario: "${desire}"
      1. Si el deseo encaja en la categoría actual (o es menor), apruébalo.
      2. Si el deseo es MUCHO más intenso que la categoría actual (ej. pedir sexo duro en TENTACION), recházalo.
      3. Si es válido pero muy suave, márcalo como 'isLowerCategory'.
    `;

    // Usamos 'generateObject' para forzar a la IA a responder SOLO en JSON
    const { object } = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: z.object({
        isApproved: z.boolean(),
        isLowerCategory: z.boolean(),
        message: z.string().describe("Feedback corto para el usuario en español, tono seductor pero claro."),
        intensityScore: z.number().min(1).max(10),
      }),
      prompt: prompt,
    });

    return Response.json(object);

  } catch (error) {
    console.error("Error IA:", error);
    return new Response(JSON.stringify({ error: 'Error procesando deseo' }), { status: 500 });
  }
}