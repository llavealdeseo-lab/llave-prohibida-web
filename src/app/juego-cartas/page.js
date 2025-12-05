// src/app/juego-cartas/page.js
// COMPONENTE ENVOLTORIO DE SERVIDOR

import { Suspense } from 'react';
import JuegoCartasContent from './JuegoCartasContent'; // Importamos el contenido del cliente

// Componente de fallback simple mientras se resuelven los parámetros de búsqueda
const LoadingFallback = () => (
    <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.5rem', color: '#FFD700', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <p>Cargando Ritual de Cartas...</p>
    </div>
);

// El componente principal usa Suspense para envolver el componente de cliente
export default function JuegoCartasPageWrapper() {
    return (
        <Suspense fallback={LoadingFallback()}>
            <JuegoCartasContent />
        </Suspense>
    );
}