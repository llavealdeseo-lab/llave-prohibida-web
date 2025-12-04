
// llave-prohibida/src/data/qrData.js

/**
 * Base de datos simulada de códigos QR.
 * Cada código representa un chocolate físico y solo puede usarse una vez.
 * 
 * Estados posibles:
 * - NEW → QR recién generado, disponible para jugar.
 * - ACTIVE → Ritual en curso (alguien lo escaneó).
 * - USED → Ritual finalizado, sesión bloqueada.
 * - DISABLED → Bloqueado manualmente desde el panel de admin.
 */

export const QR_DATA_BASE = {
  QR001: {
    id: "QR001",
    chocolateCategory: "TENTACION",
    status: "NEW",
    linkedSessionId: null,
  },
  QR002: {
    id: "QR002",
    chocolateCategory: "PASION",
    status: "NEW",
    linkedSessionId: null,
  },
  QR003: {
    id: "QR003",
    chocolateCategory: "DESEO_PROHIBIDO",
    status: "NEW",
    linkedSessionId: null,
  },
  QR004: {
    id: "QR004",
    chocolateCategory: "PASION",
    status: "USED",
    linkedSessionId: "GAME-EXAMPLE1",
  },
  QR005: {
    id: "QR005",
    chocolateCategory: "TENTACION",
    status: "DISABLED",
    linkedSessionId: null,
  },
};

/**
 * 🔍 Valida si un código QR es real y retorna sus datos.
 * Se usa en `qrService.js` y `sessionService.js`.
 */
export const validateQr = (qrId) => {
  return QR_DATA_BASE[qrId] || null;
};

/**
 * 🟢 Marca un QR como usado (una vez finalizado el ritual).
 */
export const markQrAsUsed = (qrId, sessionId) => {
  if (!QR_DATA_BASE[qrId]) return false;
  QR_DATA_BASE[qrId].status = "USED";
  QR_DATA_BASE[qrId].linkedSessionId = sessionId;
  return true;
};

/**
 * 🟡 Marca un QR como activo (cuando P1 inicia el ritual).
 */
export const markQrAsActive = (qrId, sessionId) => {
  if (!QR_DATA_BASE[qrId]) return false;
  QR_DATA_BASE[qrId].status = "ACTIVE";
  QR_DATA_BASE[qrId].linkedSessionId = sessionId;
  return true;
};

/**
 * 🔴 Desactiva o bloquea un QR manualmente (panel admin).
 */
export const disableQr = (qrId) => {
  if (!QR_DATA_BASE[qrId]) return false;
  QR_DATA_BASE[qrId].status = "DISABLED";
  return true;
};

/**
 * 🔁 Reactiva un QR (solo para pruebas locales o control de stock).
 */
export const enableQr = (qrId) => {
  if (!QR_DATA_BASE[qrId]) return false;
  QR_DATA_BASE[qrId].status = "NEW";
  QR_DATA_BASE[qrId].linkedSessionId = null;
  return true;
};

/**
 * 📋 Devuelve todos los QR (usado por el futuro panel admin).
 */
export const listAllQr = () => {
  return Object.values(QR_DATA_BASE);
};
