// llave-prohibida/src/services/sessionService.js

import { validateQr } from '@/data/qrData';

const SESSION_STORAGE_KEY = 'llave_prohibida_session';
const QR_STORAGE_KEY = 'llave_prohibida_qr';
const USED_SESSIONS_KEY = 'llave_prohibida_used_sessions'; // NUEVO

// --- utilidades internas ---
const loadUsedSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(USED_SESSIONS_KEY)) || [];
  } catch {
    return [];
  }
};

const saveUsedSessions = (list) => {
  localStorage.setItem(USED_SESSIONS_KEY, JSON.stringify(list));
};

// --- obtener estado de sesión actual ---
export const getSessionState = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error al obtener el estado de la sesión:', error);
    return null;
  }
};

// --- actualizar sesión ---
export const updateSessionState = (updates) => {
  let currentSession = getSessionState() || {};
  if (updates && typeof updates === 'object') {
    currentSession = { ...currentSession, ...updates };
  }
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
    return currentSession;
  } catch (error) {
    console.error('Error al actualizar el estado de la sesión:', error);
    return null;
  }
};

// --- procesar QR ---
export const processQrCode = (qrCode, participantId, sessionIdParam) => {
  const qrEntry = validateQr(qrCode);
  if (!qrEntry) {
    return { status: 'INVALID_QR', message: 'Código QR inválido. Vuelve a escanear.' };
  }

  // ✅ Si ya fue usado
  if (isSessionUsed(qrEntry.linkedSessionId || qrCode)) {
    return {
      status: 'USED',
      message: 'Este ritual ya fue completado.',
      sessionId: qrEntry.linkedSessionId || qrCode,
    };
  }

  const currentSession = getSessionState();
  if (currentSession && currentSession.qr === qrCode) {
    return {
      status: 'ACTIVE',
      session: currentSession,
      message: 'Sesión activa. ¡Te estábamos esperando!',
    };
  }

  // QR válido y nuevo
  return {
    status: 'READY',
    qrCode,
    category: qrEntry.chocolateCategory,
    message: '¡Listo para el Ritual! Presiona "Comenzar Ritual".',
  };
};

// --- crear nueva sesión ---
export const createNewSession = (qrCode, category) => {
  clearSessionState();

  const sessionId = `GAME-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const newSession = {
    id: sessionId,
    qr: qrCode,
    category,
    timestamp: new Date().toISOString(),
    qrStatus: 'ACTIVE',
    choice_P1: null,
    choice_P2: null,
    desire_P1: null,
    desire_P2: null,
    finalDeck: null,
  };

  updateSessionState(newSession);
  return newSession;
};

// --- marcar sesión como usada ---
export const markSessionUsed = (sessionId, result) => {
  const used = loadUsedSessions();
  if (!used.find((s) => s.id === sessionId)) {
    used.push({ id: sessionId, used: true, result });
    saveUsedSessions(used);
  }
  clearSessionState(); // limpiar sesión activa
};

// --- verificar si una sesión está usada ---
export const isSessionUsed = (sessionId) => {
  const used = loadUsedSessions();
  return used.some((s) => s.id === sessionId);
};

// --- limpiar sesión ---
export const clearSessionState = () => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(QR_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error al limpiar el estado de la sesión:', error);
    return false;
  }
};
