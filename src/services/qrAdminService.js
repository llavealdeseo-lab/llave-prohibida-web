// src/services/qrAdminService.js
// Servicio para generar, listar, togglear y validar QR
// Funciona tanto para el panel admin como para las páginas de juego.

import { QR_DATA_BASE, enableQr, disableQr } from "@/data/qrData";

/**
 * Prefijos numéricos por categoría:
 * TENTACION -> 1xx
 * PASION -> 2xx
 * DESEO_PROHIBIDO -> 3xx
 */
const categoryPrefix = (cat = "") => {
  const c = (cat || "").toUpperCase();
  if (c === "TENTACION") return 1;
  if (c === "PASION") return 2;
  if (c === "DESEO_PROHIBIDO") return 3;
  return 1;
};

const STORAGE_KEY = "llave_prohibida_qr_data";

/**
 * Asegura que QR_DATA_BASE esté sincronizado con localStorage.
 * - Si no existe nada en localStorage, lo crea con el estado inicial (QR_DATA_BASE).
 * - Si existe, lo carga en memoria (merge).
 */
const ensureLocalDb = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Guardar la copia inicial en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(QR_DATA_BASE));
    } else {
      const parsed = JSON.parse(raw);
      // Sobrescribir/merge en QR_DATA_BASE
      Object.keys(parsed).forEach((k) => {
        QR_DATA_BASE[k] = parsed[k];
      });
    }
  } catch (e) {
    console.error("qrAdminService: error al sincronizar localStorage", e);
  }
};

/**
 * validateQrFromAdmin(qrId)
 * - Devuelve un objeto consistente para que las páginas lo consuman:
 *   { isValid: boolean, status: 'AVAILABLE'|'NOT_FOUND'|'DISABLED'|'USED'|'ERROR', chocolateCategory?, message }
 */
export const validateQrFromAdmin = (qrId) => {
  if (typeof window === "undefined") {
    return { isValid: false, status: "NOT_FOUND", message: "QR no disponible en servidor." };
  }

  ensureLocalDb();

  // Primero: comprobar memoria QR_DATA_BASE
  const mem = QR_DATA_BASE && QR_DATA_BASE[qrId] ? QR_DATA_BASE[qrId] : null;
  if (mem) {
    if (mem.status === "DISABLED") return { isValid: false, status: "DISABLED", chocolateCategory: mem.chocolateCategory, message: "Este QR está deshabilitado temporalmente." };
    if (mem.status === "USED") return { isValid: false, status: "USED", chocolateCategory: mem.chocolateCategory, message: "Este QR ya fue utilizado." };
    // NEW / ACTIVE
    return { isValid: true, status: "AVAILABLE", chocolateCategory: mem.chocolateCategory, message: "QR disponible." };
  }

  // Segundo: buscar en localStorage (por si el admin panel guardó ahí)
  try {
    const rawA = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("QR_ADMIN_DB") || localStorage.getItem("qr_data_base");
    if (!rawA) return { isValid: false, status: "NOT_FOUND", message: "QR inválido o no registrado en el sistema de Llave Prohibida." };

    const parsed = JSON.parse(rawA);

    let qr = null;
    if (Array.isArray(parsed)) {
      qr = parsed.find((q) => q.id === qrId) || null;
    } else if (typeof parsed === "object") {
      qr = parsed[qrId] || Object.values(parsed).find((q) => q.id === qrId) || null;
    }

    if (!qr) return { isValid: false, status: "NOT_FOUND", message: "QR inválido o no registrado en el sistema de Llave Prohibida." };

    if (qr.status === "DISABLED") return { isValid: false, status: "DISABLED", chocolateCategory: qr.chocolateCategory, message: "Este QR está deshabilitado temporalmente." };
    if (qr.status === "USED") return { isValid: false, status: "USED", chocolateCategory: qr.chocolateCategory, message: "Este QR ya fue utilizado." };

    return { isValid: true, status: "AVAILABLE", chocolateCategory: qr.chocolateCategory || qr.chocolateCategory, message: "QR disponible." };
  } catch (e) {
    console.error("validateQrFromAdmin error parsing localStorage:", e);
    return { isValid: false, status: "ERROR", message: "Error al leer registro de QR (ver consola)." };
  }
};

/**
 * Busca el siguiente número libre en el bloque de la categoría (respeta prefijos).
 */
const nextSequentialIdForCategory = (category) => {
  ensureLocalDb();
  const prefix = categoryPrefix(category);

  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const ids = Object.keys(all)
    .map((k) => {
      const m = k.match(/^QR(\d+)/);
      return m ? Number(m[1]) : null;
    })
    .filter(Boolean);

  const start = prefix * 100;
  const end = start + 99;
  const taken = new Set(ids.filter((n) => n >= start && n <= end));

  for (let i = start; i <= end; i++) {
    if (!taken.has(i)) return `QR${String(i).padStart(3, "0")}`;
  }

  // bloque lleno (improbable en dev)
  const maxExisting = ids.length ? Math.max(...ids) : start - 1;
  return `QR${String(maxExisting + 1).padStart(3, "0")}`;
};

/**
 * Genera N códigos QR de una categoría y los persiste en localStorage + memoria.
 */
export const generateQrCodes = (count = 5, category = "PASION") => {
  ensureLocalDb();
  const localDb = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const ct = Number(count) || 1;

  for (let i = 0; i < ct; i++) {
    const id = nextSequentialIdForCategory(category);
    localDb[id] = {
      id,
      chocolateCategory: category.toUpperCase(),
      status: "NEW",
      linkedSessionId: null,
      createdAt: new Date().toISOString(),
    };
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(localDb));
  Object.assign(QR_DATA_BASE, localDb);
};

/**
 * Alterna entre DISABLED <-> NEW (y actualiza memoria)
 */
export const toggleQrStatus = (id) => {
  ensureLocalDb();
  const localDb = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const qr = localDb[id];
  if (!qr) return false;

  if (qr.status === "DISABLED") {
    qr.status = "NEW";
    enableQr(id);
  } else {
    qr.status = "DISABLED";
    disableQr(id);
  }

  localDb[id] = qr;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localDb));
  Object.assign(QR_DATA_BASE, localDb);
  return true;
};

/**
 * Obtener todos los QR, con filtro por categoría opcional.
 */
export const getAllQrs = (filterCategory = null) => {
  ensureLocalDb();
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const list = Object.values(all).sort((a, b) => (a.id > b.id ? 1 : -1));

  if (!filterCategory) return list;
  return list.filter((q) => q.chocolateCategory === filterCategory.toUpperCase());
};
