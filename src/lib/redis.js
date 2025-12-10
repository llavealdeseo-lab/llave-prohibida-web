// src/lib/redis.js
import { Redis } from '@upstash/redis';

// Inicializa la conexión a Upstash Redis usando las variables de entorno de Vercel
// Asume que KV_URL y KV_TOKEN están configuradas.
const redis = new Redis({
  url: process.env.KV_URL,
  token: process.env.KV_TOKEN,
});

/**
 * Función atómica y simplificada para verificar y aplicar el límite de peticiones (Rate Limiting).
 * * Utiliza un contador simple con expiración (Fixed Window Counter).
 * * @param {string} key - Clave única para el usuario (usualmente la IP).
 * @param {number} limit - Número máximo de peticiones permitidas (e.g., 10).
 * @param {number} windowInSeconds - Ventana de tiempo en segundos (e.g., 86400 para 1 día).
 * @returns {Promise<{success: boolean, limit: number, remaining: number, reset: number}>}
 */
export async function checkRateLimit(key, limit, windowInSeconds) {
    // Clave única basada en la IP y la ventana de tiempo (ej: rate_limit:123.45.67.89)
    const countKey = `rate_limit:${key}`;

    // 1. Ejecutar las operaciones de forma ATÓMICA (pipeline)
    const pipe = redis.pipeline();
    
    // Incrementa el contador y obtiene el nuevo valor
    pipe.incr(countKey); 
    // Obtiene el tiempo de vida (TTL) restante de la clave
    pipe.ttl(countKey);
    
    // Ejecuta ambos comandos a la vez. currentCount será el nuevo valor.
    const [currentCount, ttl] = await pipe.exec(); 

    // 2. Lógica de expiración (solo si es la primera petición)
    // Si el TTL es -1 (la clave existe pero no tiene expiración, lo cual no debería pasar) 
    // o el contador es 1 (la primera petición en la nueva ventana).
    if (ttl < 0 || currentCount === 1) {
        // Establecer el tiempo de vida (expiración) de la clave
        await redis.expire(countKey, windowInSeconds);
    }
    
    // 3. Cálculo de los valores de respuesta
    // Volvemos a pedir el TTL después de posiblemente haberlo seteado. 
    // Esto es un pequeño overhead, pero asegura el valor correcto.
    const finalTtl = await redis.ttl(countKey);
    const resetTime = Date.now() + (finalTtl * 1000);

    const remaining = Math.max(0, limit - currentCount);

    return {
        // Si el contador es menor o igual al límite, la petición es exitosa
        success: currentCount <= limit, 
        limit: limit,
        remaining: remaining,
        reset: resetTime,
    };
}