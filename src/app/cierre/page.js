

// src/app/cierre/page.js

import { Suspense } from 'react';
import CierreContent from './CierreContent'; // <-- Importa el nuevo componente de cliente

// Este componente es un Server Component (no lleva 'use client')
export default function CierrePage() {
    return (
        // El contenido que usa useSearchParams (CierreContent) está envuelto
        // Esto le permite a Next.js generar estáticamente la página sin fallar
        <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>Cargando datos de la sesión...</div>}>
            <CierreContent />
        </Suspense>
    );
}

// Nota: Elimina todos los imports y la lógica antigua de este archivo.
// Debe quedar solo lo de arriba.