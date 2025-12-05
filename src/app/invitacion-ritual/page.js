// src/app/invitacion-ritual/page.js
// ESTE ES EL COMPONENTE SERVIDOR QUE ENVUELVE AL CLIENTE

import { Suspense } from 'react';
import InvitationContent from './InvitationContent'; // <-- Importa el nuevo componente de cliente

// Este componente es un Server Component (NO lleva 'use client')
export default function InvitationPageWrapper() {
    return (
        // Envolvemos el componente de cliente en Suspense. 
        // Esto evita el error de "useSearchParams must be wrapped in a suspense boundary"
        <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center', fontSize: '1.5rem', color: '#FFD700' }}>
            Estableciendo conexión para el ritual...
        </div>}>
            <InvitationContent />
        </Suspense>
    );
}