// src/lib/redis.js
import { Redis } from '@upstash/redis';

// Inicializa la conexión a Upstash Redis usando las variables de entorno de Vercel
const redis = new Redis({
  url: process.env.KV_URL,
  token: process.env.KV_TOKEN,
});

/**
 * Función para verificar y aplicar el límite de peticiones (Rate Limiting).
 * @param {string} key - Clave única para el usuario (usualmente la IP o ID de sesión).
 * @param {number} limit - Número máximo de peticiones permitidas.
 * @param {number} windowInSeconds - Ventana de tiempo en segundos.
 * @returns {Promise<{success: boolean, limit: number, remaining: number, reset: number}>}
 */
export async function checkRateLimit(key, limit = 5, windowInSeconds = 60) {
    const pipe = redis.pipeline();
    const countKey = `rate_limit:${key}:count`;
    const timeKey = `rate_limit:${key}:time`;

    // 1. Obtener el tiempo de la primera petición
    pipe.get(timeKey);
    // 2. Obtener el contador de peticiones
    pipe.incr(countKey);
    // 3. Establecer la expiración si es la primera vez
    pipe.expire(countKey, windowInSeconds);
    
    const [startTime, currentCount, expireResult] = await pipe.exec();

    const currentCountValue = parseInt(currentCount) || 0;

    // Si el tiempo no existe, establecemos el inicio de la ventana
    if (!startTime) {
        // En este caso, asumimos que 'expire' ya fue llamado, solo guardamos el tiempo de inicio.
        await redis.set(timeKey, Date.now());
    }

    // Calcular el tiempo de reseteo (basado en el tiempo de vida del contador)
    const ttl = await redis.ttl(countKey);
    const resetTime = Date.now() + (ttl * 1000);

    const remaining = Math.max(0, limit - currentCountValue);

    return {
        success: currentCountValue <= limit,
        limit: limit,
        remaining: remaining,
        reset: resetTime,
    };
}