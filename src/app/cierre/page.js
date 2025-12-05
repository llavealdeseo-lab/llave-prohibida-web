// src/app/cierre/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./CierrePage.module.css";
import { supabase } from "@/lib/supabaseClient";

export default function CierrePage() {
    const router = useRouter();
    const params = useSearchParams();
    const sessionId = params.get("sessionId"); // ⬅️ USAR SÓLO EL PARÁMETRO CORRECTO

    const [deck, setDeck] = useState([]);
    const [p1Choice, setP1Choice] = useState(null);
    const [p2Choice, setP2Choice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("Finalizando el ritual...");

    // Helper para renderizar el contenido frontal de la carta
    const renderCardFront = (card) => (
        <div className={styles.frontContent}>
            <h3 className={styles.frontTitle}>{(card.title || "").toUpperCase()}</h3>
            <p className={styles.frontDesc}>{(card.description || "").toLowerCase()}</p>
        </div>
    );

    // Lógica principal: Obtener datos y bloquear la sesión/QR
    const finalizeSession = async () => {
        if (!sessionId) {
            setMsg("Error: Falta ID de sesión.");
            setLoading(false);
            return;
        }

        try {
            // 1. Obtener los datos finales de la sesión (Mazo, elecciones, QR asociado)
            // Se asume que la sesión tiene una columna 'qr_id' que enlaza al código.
            const { data, error } = await supabase
                .from('game_sessions')
                .select('final_deck, p1_state, p2_state, status, qr_id') // AÑADIDO: qr_id
                .eq('id', sessionId)
                .single();

            if (error || !data) throw new Error("Datos de sesión no encontrados.");

            const finalDeck = data.final_deck || [];
            const p1Sel = data.p1_state?.card_selected;
            const p2Sel = data.p2_state?.card_selected;
            const qrId = data.qr_id; // Obtengo el QR ID
            
            if (!finalDeck.length || p1Sel == null || p2Sel == null) {
                setMsg("Faltan datos de la partida (mazo o elecciones incompletas).");
                setLoading(false);
                return;
            }

            setDeck(finalDeck);
            setP1Choice(p1Sel);
            setP2Choice(p2Sel);
            
            // 2. Bloquear la sesión (Se marca como 'CLOSED' en la DB)
            if (data.status !== 'REVEALED') {
                const { error: updateError } = await supabase
                    .from('game_sessions')
                    .update({ 
                        status: 'CLOSED',
                        // Opcional: Guardar un snapshot final explícito si la tabla lo requiere
                        final_results_snapshot: { deck: finalDeck, p1: p1Sel, p2: p2Sel } 
                    })
                    .eq('id', sessionId);

                if (updateError) {
                    console.error("Error al bloquear Sesión:", updateError);
                }
            }

            // --- NUEVO REQUERIMIENTO: Bloquear QR y Aumentar Contador ---
            if (qrId) {
                // Primero, obtengo el contador actual (asumiendo columna 'scan_count' en 'qr_codes')
                const { data: qrData, error: qrFetchError } = await supabase
                    .from('qr_codes')
                    .select('scan_count')
                    .eq('id', qrId)
                    .single();

                // Si hay error (ej. no existe la fila), asumo count = 0.
                const currentCount = qrFetchError ? 0 : (qrData?.scan_count || 0);

                // Luego, actualizo el estado a 'USED' y el contador
                const { error: qrUpdateError } = await supabase
                    .from('qr_codes')
                    .update({ 
                        status: 'USED', // Marca el QR como usado para que no se pueda iniciar otro ritual
                        session_id: sessionId, // Guardo referencia a la sesión finalizada
                        scan_count: currentCount + 1 // Incremento el contador de uso
                    })
                    .eq('id', qrId);
                
                if (qrUpdateError) {
                    console.error("Error al actualizar QR:", qrUpdateError);
                }
            } else {
                console.warn("QR ID no encontrado en la sesión. No se pudo bloquear el QR en la tabla 'qr_codes'.");
            }
            // --- FIN NUEVO REQUERIMIENTO ---

            setLoading(false);
            setMsg("¡Ritual Completado!");

        } catch (e) {
            console.error("Error en CierrePage:", e);
            setMsg("Error de conexión. Intenta recargar.");
            setLoading(false);
        }
    };

    useEffect(() => {
        finalizeSession();
    }, [sessionId]);

    const handleExplore = () => {
        // Redirige a la página principal (Modo Exploración)
        router.push(`/`);
    };
    
    // --- RENDER ---
    if (loading) return <div className={styles.loadingContainer}><p className={styles.loadingText}>{msg}</p></div>;

    return (
        <main className={styles.main}>
            <section className={styles.legendSection}>
                <h1>El Velo de la Noche ha Caído.</h1>
                <p className={styles.legend}>
                    &quot;El ritual ha terminado, recuerden que se comprometieron a cumplir. Aquí están sus dos tareas.&quot;
                </p>
            </section>

            <section className={styles.board}>
                {deck.map((card, idx) => {
                    const isP1Winner = p1Choice === idx;
                    const isP2Winner = p2Choice === idx;
                    
                    // Aplicar borde de ganador (P1: blanco, P2: amarillo)
                    let cardClasses = styles.card;
                    if (isP1Winner) cardClasses += ` ${styles.winnerP1}`;
                    if (isP2Winner) cardClasses += ` ${styles.winnerP2}`;

                    return (
                        <div key={idx} className={styles.cardWrapper}>
                             <div className={cardClasses}>
                                 {/* La cara frontal siempre se muestra en la página de cierre */}
                                 {renderCardFront(card)}
                             </div>
                        </div>
                    );
                })}
            </section>

            <section className={styles.footerSection}>
                <p className={styles.closureMessage}>
                    &quot;Su sesión ha terminado. El código QR se bloqueará y no podrán usarlo para jugar de nuevo, 
                    aunque sí les quedará de recuerdo. Si lo escanean les mostrará esta pantalla.&quot;
                </p>
                <p className={styles.exploreMessage}>
                    Si quieren una revancha, o la llave que compraron no incluía tu verdadero deseo, 
                    puedes explorar qué chocolate lo incluye.
                </p>
                
                <button 
                    className={styles.exploreButton}
                    onClick={handleExplore}
                >
                    EXPLORAR CHOCOLATE
                </button>
                <footer className={styles.sessionFooter}>
                    <small>ID de Sesión: <strong>{sessionId}</strong></small>
                </footer>
            </section>
        </main>
    );
}