// src/app/juego-cartas/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./JuegoCartas.module.css";
import { supabase } from "@/lib/supabaseClient";
import { iaService } from "@/services/iaService";

export default function JuegoCartasPage() {
  const router = useRouter();
  const params = useSearchParams();
  
  const sessionId = params.get("session") || params.get("sessionId");
  const role = (params.get("role") || params.get("joinAs") || "p1").toLowerCase(); 

  const [sessionData, setSessionData] = useState(null);
  const [deck, setDeck] = useState([]); 
  const [msg, setMsg] = useState("Conectando con la mesa...");
  
  // Estados visuales
  const [myChoice, setMyChoice] = useState(null);
  const [partnerChoice, setPartnerChoice] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Control de generación para no llamar a la IA 10 veces
  const isGeneratingRef = useRef(false);

  // 1. CARGA INICIAL + REALTIME + GENERACIÓN AUTOMÁTICA
  useEffect(() => {
    if (!sessionId) {
        setMsg("Error: Falta ID de sesión.");
        return;
    }

    // Función para procesar los datos que llegan (de carga inicial o de realtime)
    const processSessionData = async (data) => {
        setSessionData(data);

        // A. SI YA HAY MAZO -> MOSTRAR JUEGO
        if (data.final_deck && Array.isArray(data.final_deck) && data.final_deck.length > 0) {
            setDeck(data.final_deck);
            setMsg("");
            
            // Sincronizar elecciones
            const p1Sel = data.p1_state?.card_selected;
            const p2Sel = data.p2_state?.card_selected;
            const amIP1 = role === 'p1';

            setMyChoice(amIP1 ? p1Sel : p2Sel);
            setPartnerChoice(amIP1 ? p2Sel : p1Sel);

            // Sincronizar Revelación
            if (data.status === 'REVEALED') {
                setIsRevealed(true);
            } else if (p1Sel != null && p2Sel != null) {
                // Si ambos eligieron pero la DB no dice REVEALED, lo forzamos (solo P1)
                if (amIP1) await supabase.from('game_sessions').update({ status: 'REVEALED' }).eq('id', sessionId);
            }
            return; 
        }

        // B. SI NO HAY MAZO -> VERIFICAR SI PODEMOS GENERARLO
        const p1Ready = data.p1_state?.desire && data.p1_state?.desire_category;
        const p2Ready = data.p2_state?.desire && data.p2_state?.desire_category;

        if (p1Ready && p2Ready) {
            // Ambos tienen deseos. ¿Soy P1? -> Genero el mazo.
            if (role === 'p1') {
                if (isGeneratingRef.current) return; // Evitar doble llamada
                isGeneratingRef.current = true;
                setMsg("🔮 La IA está creando el ritual... (No recargues)");

                try {
                    const genResult = await iaService.generateFinalDeck(
                        data.category, 
                        { text: data.p1_state.desire, score: data.p1_state.score }, 
                        { text: data.p2_state.desire, score: data.p2_state.score }
                    );

                    await supabase.from('game_sessions').update({ final_deck: genResult.deck }).eq('id', sessionId);
                    // No seteamos deck aquí, esperamos a que el Realtime nos devuelva la actualización para estar sincronizados.
                } catch (e) {
                    console.error("Error IA:", e);
                    setMsg("Error generando cartas. Reintentando...");
                    isGeneratingRef.current = false;
                }
            } else {
                setMsg("Tu pareja está barajando las cartas...");
            }
        } else {
            // Falta alguien
            if (!p1Ready && !p2Ready) setMsg("Esperando deseos de ambos...");
            else if (!p1Ready) setMsg("Esperando el deseo del Jugador 1...");
            else if (!p2Ready) setMsg("Esperando a que tu pareja confirme su deseo...");
        }
    };

    // Carga inicial
    const fetchInitial = async () => {
        const { data, error } = await supabase.from('game_sessions').select('*').eq('id', sessionId).single();
        if (data && !error) processSessionData(data);
    };
    fetchInitial();

    // SUSCRIPCIÓN REALTIME (Escucha todo cambio)
    const channel = supabase
      .channel(`game_logic_${sessionId}`)
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
          (payload) => processSessionData(payload.new)
      )
      .subscribe();

    // POLLING DE RESPALDO (Cada 2s por si falla Realtime)
    const interval = setInterval(fetchInitial, 2000);

    return () => { 
        supabase.removeChannel(channel); 
        clearInterval(interval);
    };
  }, [sessionId, role]);


  // 2. SELECCIÓN DE CARTA
  const handleSelect = async (index) => {
    // Bloqueos locales instantáneos
    if (isRevealed) return;
    if (myChoice != null) return; 
    if (partnerChoice === index) return; 

    // Optimistic UI (Feedback inmediato al usuario)
    setMyChoice(index);

    try {
        const playerKey = role === 'p1' ? 'p1_state' : 'p2_state';
        // Leer estado actual para no borrar datos
        const { data: current } = await supabase.from('game_sessions').select(playerKey).eq('id', sessionId).single();
        const currentState = current ? current[playerKey] : {};

        await supabase.from('game_sessions').update({
            [playerKey]: { ...currentState, card_selected: index }
        }).eq('id', sessionId);

    } catch (e) {
        console.error("Error al elegir:", e);
        setMyChoice(null); // Revertir si falla
    }
  };

  // 3. TRANSICIÓN A CIERRE
  useEffect(() => {
    if (isRevealed) {
        const timer = setTimeout(() => {
            router.push(`/cierre?sessionId=${sessionId}`);
        }, 6000); 
        return () => clearTimeout(timer);
    }
  }, [isRevealed, router, sessionId]);


  // --- RENDER ---
  const renderCardFront = (card) => (
      <div className={styles.frontContent}>
        <h3 className={styles.frontTitle}>{(card.title || "").toUpperCase()}</h3>
        <p className={styles.frontDesc}>{(card.description || "").toLowerCase()}</p>
      </div>
  );

  // Si no hay mazo, mostramos pantalla de carga con el mensaje de estado
  if (!deck.length) return <div className={styles.loadingContainer}><p className={styles.loadingText}>{msg}</p></div>;

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.roleBadge}>
             {role === 'p1' ? "JUGADOR 1" : "JUGADOR 2"}
        </div>
        <p className={styles.legend}>
           {isRevealed 
             ? "¡El destino ha sido revelado!" 
             : partnerChoice != null 
                ? "¡Tu pareja ya eligió! Esa carta está bloqueada." 
                : "Elige una carta para sellar tu deseo."}
        </p>
      </div>

      <section className={styles.board}>
        {deck.map((card, idx) => {
          const isMine = myChoice === idx;
          const isPartners = partnerChoice === idx;
          const isBlocked = isPartners && !isRevealed; // Bloqueo visual antes de revelar

          // Clases CSS dinámicas
          let wrapperClass = styles.cardWrapper;
          if (isRevealed) wrapperClass += ` ${styles.flipped}`;
          
          // Bordes de selección
          let borderClass = '';
          if (isMine) borderClass = role === 'p1' ? styles.borderP1 : styles.borderP2;
          if (isPartners) borderClass = role === 'p1' ? styles.borderP2 : styles.borderP1;

          return (
            <div key={idx} className={wrapperClass}>
              <div className={`${styles.cardInner} ${borderClass}`}>
                  
                  {/* CARA TRASERA (Boca abajo) */}
                  <div className={styles.cardBack} onClick={() => !isBlocked && !isRevealed && handleSelect(idx)}>
                     {!isRevealed && isPartners && <div className={styles.lockIcon}>🔒</div>}
                     {!isRevealed && isMine && <div className={styles.checkIcon}>✅</div>}
                  </div>

                  {/* CARA FRONTAL (Boca arriba) */}
                  <div className={styles.cardFront}>
                    {renderCardFront(card)}
                  </div>

              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}