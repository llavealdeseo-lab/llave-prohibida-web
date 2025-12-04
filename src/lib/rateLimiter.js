// src/lib/rateLimiter.js
import { Redis } from '@upstash/redis';

// Las variables de entorno se cargan automáticamente
const redis = new Redis({
  url: process.env.KV_URL,
  token: process.env.KV_TOKEN,
});

// Parámetros de Rate Limiting (10 llamadas por día)
const MAX_CALLS = 10;
const WINDOW_SECONDS = 86400; // 24 horas = 60*60*24

/**
 * Verifica si un identificador (sessionId) ha excedido el límite de llamadas diarias.
 * @param {string} key - La clave única (ej: 'GAME-XXXX' o la IP).
 * @returns {Promise<{limited: boolean, remaining: number}>} - Estado del límite.
 */
export async function checkRateLimit(key) {
  const redisKey = `rate_limit:${key}`;
  
  // Usamos un pipeline para ejecutar INCR y TTL en una sola operación atómica (más seguro)
  const pipeline = redis.pipeline();
  
  // 1. Incrementa el contador
  pipeline.incr(redisKey); 
  
  // 2. Obtiene el tiempo de vida (Time To Live) de la clave
  pipeline.ttl(redisKey);

  // Ejecuta ambas operaciones
  const [count, ttl] = await pipeline.exec();

  // Si el contador es 1 (primera llamada del día), establece la expiración a 24 horas
  if (count === 1) {
    await redis.expire(redisKey, WINDOW_SECONDS);
  }

  const limited = count > MAX_CALLS;
  // Si el count es > 10, remaining será 0. Si es 5, remaining es 5.
  const remaining = Math.max(0, MAX_CALLS - count); 

  return { limited, remaining };
}