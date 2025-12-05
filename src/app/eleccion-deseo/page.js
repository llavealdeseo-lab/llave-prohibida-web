
// src/app/eleccion-deseo/page.js
// ESTE ARCHIVO ES EL SERVER COMPONENT QUE ENVUELVE AL CLIENTE

import { Suspense } from 'react';
import EleccionContent from './EleccionContent'; // <-- Importa el nuevo componente de cliente

// Este componente es un Server Component (NO lleva 'use client')
export default function EleccionDeseoPage() {
    return (
        // Envolvemos el componente de cliente en Suspense.
        // Esto le permite a Next.js generar estáticamente la página sin fallar
        // en el 'useSearchParams' durante el build.
        <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center', fontSize: '1.5rem', color: '#FFF' }}>
            Preparando la elección de tu deseo...
        </div>}>
            <EleccionContent />
        </Suspense>
    );
}