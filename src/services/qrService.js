// llave-prohibida/src/services/qrService.js

// ✅ Importa la función real que valida los QR
import { validateQr } from '@/data/qrData';

/**
 * Servicio de validación de QR (Frontend)
 * Verifica que el código QR exista, no esté usado y devuelve su tipo de chocolate.
 * Compatible con sessionService y InvitationPage.
 * 
 * @param {string} qrId - ID del código QR escaneado (ej: 'QR001')
 * @returns {object} - { isValid, message, chocolateType, status }
 */
export const validateQrCode = (qrId) => {
  const qrRecord = validateQr(qrId); // usamos la función real

  if (!qrRecord) {
    return {
      isValid: false,
      message: 'QR no encontrado. El código es inválido o no pertenece a Llave Prohibida.',
      chocolateType: null,
      status: 'INVALID',
    };
  }

  if (qrRecord.status === 'USED') {
    return {
      isValid: false,
      message: 'Este código QR ya fue utilizado para un Ritual de Llave Prohibida.',
      chocolateType: qrRecord.chocolateCategory,
      status: 'USED',
    };
  }

  return {
    isValid: true,
    message: `Código QR validado. ¡Inicia tu Ritual de ${qrRecord.chocolateCategory}!`,
    chocolateType: qrRecord.chocolateCategory,
    status: 'NEW',
  };
};
