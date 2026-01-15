// src/app/juego-cartas/JuegoCartasContent.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./JuegoCartas.module.css";
import { supabase } from "@/lib/supabaseClient";
import { iaService } from "@/services/iaService";

const RPS_OPTIONS = [
    { id: 'rock', emoji: '🪨', label: 'Piedra' },
    { id: 'paper', emoji: '📄', label: 'Papel' },
    { id: 'scissors', emoji: '✂️', label: 'Tijera' }
];

export default function JuegoCartasContent() {
    const router = useRouter();
    const params = useSearchParams();

    const sessionId = params.get("session") || params.get("sessionId");
    const role = (params.get("role") || params.get("joinAs") || "p1").toLowerCase();

    const [sessionData, setSessionData] = useState(null);
    const [deck, setDeck] = useState([]);
    const [msg, setMsg] = useState("Conectando con la mesa...");

    // Estados de Juego
    const [rpsChoice, setRpsChoice] = useState(null);
    const [myChoice, setMyChoice] = useState(null);
    const [partnerChoice, setPartnerChoice] = useState(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [discardedIndices, setDiscardedIndices] = useState([]);

    const isGeneratingRef = useRef(false);
    const backupTimeoutRef = useRef(null);

    // --- 1. LÓGICA DE SINCRONIZACIÓN (REALTIME) ---
    useEffect(() => {
        if (!sessionId) return setMsg("Error: Falta ID de sesión.");

        const processSessionData = async (data) => {
            console.log("📥 Sync Phase:", data.status);
            setSessionData(data);
            const amIP1 = role === 'p1';
            const myState = amIP1 ? data.p1_state : data.p2_state;
            const partnerState = amIP1 ? data.p2_state : data.p1_state;

            // A. CARGAR MAZO
            if (data.final_deck && data.final_deck.length > 0) {
                setDeck(data.final_deck);
                setMsg("");

                if (backupTimeoutRef.current) {
                    clearTimeout(backupTimeoutRef.current);
                    backupTimeoutRef.current = null;
                }

                setRpsChoice(myState?.rps_choice);
                setMyChoice(myState?.card_selected);
                setPartnerChoice(partnerState?.card_selected);
                setDiscardedIndices(data.p1_state?.discarded_indices || []);

                if (data.status === 'REVEALED') setIsRevealed(true);

                // DETERMINAR GANADOR RPS SI AMBOS ELIGIERON
                if (data.status === 'RPS' && data.p1_state?.rps_choice && data.p2_state?.rps_choice) {
                    if (role === 'p1') {
                        const winner = calculateRPSWinner(data.p1_state.rps_choice, data.p2_state.rps_choice);
                        if (winner === 'tie') {
                            await supabase.from('game_sessions').update({
                                'p1_state': { ...data.p1_state, rps_choice: null },
                                'p2_state': { ...data.p2_state, rps_choice: null }
                            }).eq('id', sessionId);
                        } else {
                            // Defensive update: Some environments might lack ai_narration column
                            const updatePayload = {
                                status: 'DISCARD',
                                'p1_state': { ...data.p1_state, rps_winner: winner }
                            };
                            await supabase.from('game_sessions').update(updatePayload).eq('id', sessionId);
                        }
                    }
                }
                return;
            }

            // B. GENERAR MAZO SI AMBOS LISTOS
            if (data.p1_state?.desire && data.p2_state?.desire && data.status === 'ACTIVE') {
                if (role === 'p1' && !isGeneratingRef.current) {
                    isGeneratingRef.current = true;
                    setMsg("🔮 El Maestro de Ceremonias está barajando...");
                    try {
                        const genResult = await iaService.generateFinalDeck(
                            data.category,
                            data.p1_state,
                            data.p2_state,
                            data.p1_state.profile,
                            data.p2_state.profile,
                            data.p1_state.name,
                            data.p2_state.name
                        );

                        // Intento de actualización robusto
                        const mainPayload = {
                            final_deck: genResult.deck,
                            status: 'RPS'
                        };

                        let { error: updateError } = await supabase.from('game_sessions').update(mainPayload).eq('id', sessionId);

                        if (!updateError) {
                            // Intentar guardar la narración por separado si la columna existe
                            if (genResult.narration) {
                                await supabase.from('game_sessions').update({ ai_narration: genResult.narration }).eq('id', sessionId).then(({ error }) => {
                                    if (error) console.warn("Columna ai_narration no encontrada o error al guardar, continuando...");
                                });
                            }
                        } else {
                            console.error("Error fatal al guardar mazo:", updateError);
                            isGeneratingRef.current = false;
                        }
                    } catch (e) {
                        console.error("Error en flujo de generación:", e);
                        isGeneratingRef.current = false;
                    }
                }
            }
        };

        const calculateRPSWinner = (p1, p2) => {
            if (p1 === p2) return 'tie';
            if ((p1 === 'rock' && p2 === 'scissors') || (p1 === 'paper' && p2 === 'rock') || (p1 === 'scissors' && p2 === 'paper')) return 'p1';
            return 'p2';
        };

        const fetchInitial = async () => {
            const { data } = await supabase.from('game_sessions').select('*').eq('id', sessionId).single();
            if (data) processSessionData(data);
        };
        fetchInitial();

        const channel = supabase.channel(`game_${sessionId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` }, (p) => processSessionData(p.new)).subscribe();
        const interval = setInterval(fetchInitial, 3000);
        return () => { supabase.removeChannel(channel); clearInterval(interval); };
    }, [sessionId, role]);

    // Ocultar acciones del jugador para brevedad, son iguales a la versión anterior
    const handleRpsSelect = async (choice) => {
        if (rpsChoice) return;
        setRpsChoice(choice);
        const playerKey = role === 'p1' ? 'p1_state' : 'p2_state';
        const { data } = await supabase.from('game_sessions').select(playerKey).eq('id', sessionId).single();
        await supabase.from('game_sessions').update({
            [playerKey]: { ...data[playerKey], rps_choice: choice }
        }).eq('id', sessionId);
    };

    const handleDiscard = async (index) => {
        const rpsWinner = sessionData.p1_state?.rps_winner;
        if (sessionData.status !== 'DISCARD' || rpsWinner !== role) return;
        if (discardedIndices.includes(index)) return;
        if (deck[index]?.isParticipantDesire && deck[index]?.owner === role.toUpperCase()) return;

        const newDiscarded = [...discardedIndices, index];
        setDiscardedIndices(newDiscarded);

        if (newDiscarded.length === 2) {
            await supabase.from('game_sessions').update({
                'p1_state': { ...sessionData.p1_state, discarded_indices: newDiscarded },
                status: 'CHOOSING'
            }).eq('id', sessionId);
        } else {
            setMsg(`¡Vas 1! Elige otra.`);
        }
    };

    const handleFinalSelect = async (index) => {
        const rpsWinner = sessionData.p1_state?.rps_winner;
        const loser = rpsWinner === 'p1' ? 'p2' : 'p1';
        if (sessionData.status !== 'CHOOSING' || role !== loser) return;
        if (discardedIndices.includes(index) || myChoice != null) return;

        setMyChoice(index);
        const playerKey = role === 'p1' ? 'p1_state' : 'p2_state';
        const { data } = await supabase.from('game_sessions').select(playerKey).eq('id', sessionId).single();
        await supabase.from('game_sessions').update({
            [playerKey]: { ...data[playerKey], card_selected: index },
            status: 'REVEALED'
        }).eq('id', sessionId);
    };

    useEffect(() => {
        if (isRevealed) {
            setTimeout(() => router.push(`/cierre?sessionId=${sessionId}`), 8000);
        }
    }, [isRevealed, router, sessionId]);

    if (!deck.length) return <div className={styles.loadingContainer}><div className={styles.loadingInner}><p className={styles.ritualCall}>🔮 Preparando Duelo...</p>{sessionData?.ai_narration && <p className={styles.aiWhisperNarration}><em>"{sessionData.ai_narration}"</em></p>}<p className={styles.loadingText}>{msg}</p></div></div>;

    const rpsWinner = sessionData.p1_state?.rps_winner;
    const isWinner = rpsWinner === role;
    const isLoser = rpsWinner && rpsWinner !== role;
    const currentPhase = sessionData.status;

    return (
        <main className={styles.main}>
            {currentPhase === 'RPS' && (
                <div className={styles.rpsOverlay}>
                    <h2 className={styles.rpsTitle}>Duelo de Iniciativa</h2>
                    <p className={styles.legend}>El ganador eliminará 2 cartas. El perdedor elegirá la última.</p>
                    <div className={styles.rpsOptions}>
                        {RPS_OPTIONS.map(opt => (
                            <button key={opt.id} onClick={() => handleRpsSelect(opt.id)} className={`${styles.rpsOption} ${rpsChoice === opt.id ? styles.selected : ''}`}>
                                {opt.emoji}
                            </button>
                        ))}
                    </div>
                    {rpsChoice && <p className={styles.loadingText}>Esperando al oponente...</p>}
                </div>
            )}

            <div className={styles.header}>
                <div className={styles.roleBadge}>{role.toUpperCase()}</div>
                <h3 className={styles.rpsWinnerMsg}>
                    {currentPhase === 'DISCARD' && (isWinner ? "¡TU TURNO! DESCARTA 2" : "ESPERA... TU PAREJA ELIMINA")}
                    {currentPhase === 'CHOOSING' && (isLoser ? "¡TU TURNO! ELIGE EL FINAL" : "TU PAREJA ELIGE EL FINAL")}
                    {currentPhase === 'REVEALED' && "EL DESTINO SE HA SELLADO"}
                </h3>
            </div>

            <section className={styles.board}>
                {deck.map((card, idx) => {
                    const isDiscarded = discardedIndices.includes(idx);
                    const isProtected = card.isParticipantDesire && card.owner === role.toUpperCase();
                    const isWinnerAction = currentPhase === 'DISCARD' && isWinner;
                    const isLoserAction = currentPhase === 'CHOOSING' && isLoser;

                    return (
                        <div key={idx} className={`${styles.cardWrapper} ${(isRevealed || isDiscarded) ? styles.flipped : ''} ${isProtected ? styles.protectedCard : ''}`}>
                            <div className={`${styles.cardInner} ${myChoice === idx ? styles.borderP1 : ''} ${partnerChoice === idx ? styles.borderP2 : ''}`}>
                                <div className={styles.cardBack} onClick={() => {
                                    if (isWinnerAction) handleDiscard(idx);
                                    else if (isLoserAction) handleFinalSelect(idx);
                                }}>
                                    {!isDiscarded && myChoice === idx && <div className={styles.checkIcon}>✅</div>}
                                    {isProtected && !isDiscarded && currentPhase === 'DISCARD' && <div className={styles.protectedBadge}>TU DESEO</div>}
                                </div>
                                <div className={styles.cardFront}>
                                    {isDiscarded ? (
                                        <div className={styles.discardedLabel}>ELIMINADA</div>
                                    ) : (
                                        <div className={styles.frontContent}>
                                            <h4 className={styles.frontTitle}>{card.title}</h4>
                                            <p className={styles.frontDesc}>{card.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>
        </main>
    );
}
