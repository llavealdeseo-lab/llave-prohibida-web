// src/app/invitacion-ritual/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import styles from "./InvitationPage.module.css";
import { supabase } from "@/lib/supabaseClient";

// Función auxiliar para deducir categoría (Se mantiene, aunque ahora usamos la DB como fuente principal)
const getCategoryFromQr = (qrCode) => {
  if (!qrCode) return "PASION";
  const num = parseInt(qrCode.replace(/\D/g, ""), 10);
  if (isNaN(num)) return "PASION";
  
  if (num >= 100 && num < 200) return "TENTACION";
  if (num >= 200 && num < 300) return "PASION";
  if (num >= 300 && num < 400) return "DESEO_PROHIBIDO";
  return "PASION"; 
};

export default function InvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parámetros
  const joinAs = searchParams.get("joinAs") || "p1"; 
  const qrParam = searchParams.get("qr");             
  const sessionIdParam = searchParams.get("sessionId");

  // Estados
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState(""); // Nombre del usuario local
  const [partnerName, setPartnerName] = useState(""); // Nombre de la pareja
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Referencia para el "Latido" (Polling)
  const pollingRef = useRef(null);

  useEffect(() => setIsClient(true), []);

  // ----------------------------------------------------------------
  // 1️⃣ LÓGICA DE SEGURIDAD E INICIALIZACIÓN (FUSIONADO)
  // ----------------------------------------------------------------
  useEffect(() => {
    const initSession = async () => {
      if (!isClient) return;
      
      try {
        setLoading(true);

        // 🛑 INICIO DEL BLOQUEO: Si hay ID de sesión, verificamos el estado antes de todo
        if (sessionIdParam) {
            const { data: sessionStatus } = await supabase
               .from('game_sessions')
               .select('status')
               .eq('id', sessionIdParam)
               .single();

            // Si la sesión existe y está en estado 'CLOSED', redirigir al cierre
            if (sessionStatus && sessionStatus.status === 'CLOSED') {
                router.replace(`/cierre?sessionId=${sessionIdParam}`);
                return; // Detener la ejecución de initSession
            }
        }
        // 🛑 FIN DEL BLOQUEO

        // --- CASO P2: UNIRSE A SESIÓN ---
        if (joinAs === "p2" && sessionIdParam) {
          const p2LocalToken = localStorage.getItem(`p2_owner_${sessionIdParam}`);

          // Buscar sesión en nube
          const { data: sessionData, error } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('id', sessionIdParam)
            .single();

          if (error || !sessionData) {
            setErrorMsg("La sesión no existe o ha expirado.");
            setLoading(false);
            return;
          }

          // SEGURIDAD: ¿Ya hay alguien conectado y NO soy yo?
          if (sessionData.p2_state?.connected && !p2LocalToken) {
              setErrorMsg("⛔ Esta sesión ya tiene un Jugador 2 activo.");
              setLoading(false);
              return;
          }

          // Si ya soy dueño, recupero nombre y marco listo
          if (p2LocalToken && sessionData.p2_state?.name) {
              setUserName(sessionData.p2_state.name);
              setIsReadyToStart(true); // Ya estaba dentro
          }

          setSession(sessionData);
        } 
        
        // --- CASO P1: CREAR SESIÓN con validación de QR ---
        else if (joinAs === "p1" && qrParam) {
            
            // 🔒 SEGURIDAD: VERIFICAR QR EN BASE DE DATOS
            const { data: qrData, error: qrError } = await supabase
              .from('qr_codes')
              .select('*')
              .eq('id', qrParam)
              .single();

            // 1. ¿Existe el QR?
            if (qrError || !qrData) {
                setErrorMsg("❌ Código QR no válido o no registrado en el sistema.");
                setLoading(false);
                return;
            }

            // 2. ¿Está bloqueado por admin?
            if (qrData.status === 'DISABLED') {
                setErrorMsg("⚠️ Este código ha sido desactivado por administración.");
                setLoading(false);
                return;
            }

            // 3. ¿Ya fue usado (Ritual terminado)?
            if (qrData.status === 'USED') {
                // Si el QR está usado, buscamos la sesión asociada a ese QR (debería ser la última)
                const { data: closedSession } = await supabase
                    .from('game_sessions')
                    .select('id, status')
                    .eq('qr_id', qrParam)
                    .eq('status', 'REVEALED') // Buscamos solo sesiones que se marcaron como cerradas
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (closedSession && closedSession.status === 'REVEALED') {
                    // Si encontramos la sesión cerrada, ¡redirigimos al resultado!
                    router.replace(`/cierre?sessionId=${closedSession.id}`);
                    return; // Detener initSession y redirigir
                } else {
                    // Si el estado es 'USED' pero no encontramos la sesión (un caso raro, ej. borrada), mostramos el error original
                    setErrorMsg("🔒 Este ritual ya fue consumido. Los códigos son de un solo uso. No se encontró el resultado.");
                    setLoading(false);
                    return;
                }
            
            }

            // 4. Si es válido (NEW o ACTIVE), procedemos.
            // Si está NEW, lo pasamos a ACTIVE para indicar que "se abrió el paquete"
            if (qrData.status === 'NEW') {
                await supabase.from('qr_codes').update({ status: 'ACTIVE' }).eq('id', qrParam);
            }

            // --- CREACIÓN O RECUPERACIÓN DE SESIÓN ---
            
            // Intentamos ver si ya hay una sesión ACTIVA para este QR (Re-conexión P1)
            const { data: existingSession } = await supabase
               .from('game_sessions')
               .select('*')
               .eq('qr_id', qrParam)
               .eq('status', 'ACTIVE') // Solo sesiones vivas
               .order('created_at', { ascending: false })
               .limit(1)
               .single();

            if (existingSession) {
               // Recuperamos la sesión existente
               setSession(existingSession);
               if (existingSession.p1_state?.name) setUserName(existingSession.p1_state.name);
               // Si P2 ya estaba, actualizamos estado
               if (existingSession.p2_state?.connected) {
                  setIsReadyToStart(true);
                  if (existingSession.p2_state.name) setPartnerName(existingSession.p2_state.name);
               }
            } else {
               // 🛑 NUEVA LÓGICA DE LIMPIEZA 🛑
                // 1. Marcar cualquier sesión anterior que no sea REVELED como CANCELED.
                await supabase
                    .from('game_sessions')
                    .update({ status: 'CANCELED' }) // ⬅️ Usamos CANCELED para "huérfana"
                    .eq('qr_id', qrParam)
                    .neq('status', 'REVELED'); // No tocar las que ya terminaron
               // Creamos NUEVA sesión
               const newId = `GAME-${Date.now().toString(36).toUpperCase()}`;
               const newSessionObj = {
                 id: newId,
                 qr_id: qrParam,
                 category: qrData.category, // USAMOS LA CATEGORÍA DE LA BASE DE DATOS
                 status: 'ACTIVE',
                 p1_state: { connected: true, name: "" },
                 p2_state: { connected: false, name: "" }
               };

               const { error: createError } = await supabase.from('game_sessions').insert([newSessionObj]);
               if (createError) throw createError;
               setSession(newSessionObj);
               setIsReadyToStart(false); // P1 siempre empieza esperando
            }

        } 
        else {
           setErrorMsg("QR no detectado o enlace inválido.");
        }

      } catch (err) {
        console.error("Error:", err);
        setErrorMsg("Error de conexión. Intenta recargar.");
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [isClient, joinAs, qrParam, sessionIdParam, router]); // Añadido 'router' a las dependencias

  // ----------------------------------------------------------------
  // 2️⃣ SISTEMA DE ESCUCHA DOBLE (Latido + Realtime)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!session?.id) return;

    const checkStatus = (data) => {
        // Actualizamos datos locales
        setSession(data);
        
        // Si soy P1, verifico si P2 entró
        if (joinAs === "p1" && data.p2_state?.connected) {
            setIsReadyToStart(true);
            if (data.p2_state.name) setPartnerName(data.p2_state.name);
        }
        // Si soy P2, marco listo si ya me uní, pero el inicio depende de P1
        if (joinAs === "p2" && data.p2_state?.connected && data.p2_state.name) {
             // Si el juego comienza desde la nube, redirigir
             // (Aunque P2 no tiene botón de inicio, se queda esperando el inicio de P1)
        }
    };

    // A) Realtime (Rápido)
    const channel = supabase
      .channel(`room_${session.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${session.id}` },
        (payload) => checkStatus(payload.new)
      )
      .subscribe();

    // B) Latido / Polling (Seguro - Cada 2 segundos)
    pollingRef.current = setInterval(async () => {
        const { data } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('id', session.id)
            .single();
        if (data) checkStatus(data);
    }, 2000);

    return () => { 
        supabase.removeChannel(channel); 
        clearInterval(pollingRef.current);
    };
  }, [session?.id, joinAs]);

  // ----------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------
  
  // P1 guarda su nombre (opcional)
  const handleSaveNameP1 = async () => {
    if (!userName.trim() || !session) return;
    await supabase.from('game_sessions').update({
        p1_state: { ...session.p1_state, name: userName }
    }).eq('id', session.id);
  };

  // P2 se une oficialmente
  const handleJoinP2 = async () => {
    if (!userName.trim()) return alert("Por favor, escribe tu nombre para entrar.");
    
    setLoading(true);
    // 1. Marca propiedad en este navegador
    localStorage.setItem(`p2_owner_${sessionIdParam}`, 'true');

    // 2. Actualiza Nube
    await supabase.from('game_sessions').update({
        p2_state: { connected: true, name: userName, desire: null }
    }).eq('id', session.id);

    setIsReadyToStart(true);
    setLoading(false);
  };

  const generateSessionLink = () => {
    if (!session) return "#";
    return `${window.location.origin}/invitacion-ritual?sessionId=${session.id}&joinAs=p2&qr=${qrParam || session.qr_id}`;
  };

  const handleStart = () => {
    if (joinAs === "p1" && !isReadyToStart) return;
    router.push(
      `/eleccion-deseo?sessionId=${session.id}&joinAs=${joinAs}&category=${session.category}`
    );
  };

  const colors = {
    TENTACION: { text: "#800020" },
    PASION: { text: "#C0C0C0" },
    DESEO_PROHIBIDO: { text: "#FFD700" },
    SORPRESA: { text: "#000000" },
  };

  const categoryName = session?.category?.toUpperCase() || getCategoryFromQr(qrParam) || "PASION";
  const textColor = colors[categoryName]?.text || "#FFD700";

  if (loading && !session) return <div className={styles.loadingScreen}><p>Conectando...</p></div>;

  return (
    <main className={styles.invitationContainer}>
      <video
        autoPlay loop muted playsInline
        className={styles.heroVideo}
        src="/videos/export/storytelling/hero_loop.mp4"
      />

      <section className={styles.overlay}>
        <Image
          src="/icons/export/logo_llaveprohibida_200.png"
          alt="Llave Prohibida Logo"
          className={styles.logo}
        />

        {errorMsg ? (
          <div className={styles.errorWrapper}>
             <p className={styles.errorText}>{errorMsg}</p>
             <button onClick={() => window.location.reload()} className={styles.ctaButton} style={{marginTop:'1rem'}}>REINTENTAR</button>
          </div>
        ) : (
          <>
            <p className={styles.text}>
              Este es un espacio seguro para expresar tus deseos más ocultos.{" "}
              <span className={styles.highlight}>
                No solo compraste un chocolate, compraste una llave.
              </span>
              <br /><br />
              <span className={styles.highlight}>TENTACIÓN:</span> suave y romántica.<br />
              <span className={styles.highlight}>PASIÓN:</span> rompe la rutina.<br />
              <span className={styles.highlight}>DESEO PROHIBIDO:</span> sin límites.<br />
              <br />
              <strong>TU LLAVE ES:</strong>
            </p>

            <h2 className={styles.categoryTitle} style={{ color: textColor }}>
              {categoryName}
            </h2>

            {/* --- ZONA P1: QR + INPUT NOMBRE --- */}
            {joinAs === "p1" && session && (
              <div className={styles.qrSection}>
                
                {/* Nuevo: Input P1 */}
                <div style={{marginBottom: '15px'}}>
                    <input 
                      type="text" 
                      placeholder="Tu Nombre..." 
                      className={styles.ctaButton} // Reusamos estilo botón para input rápido o definimos uno inline
                      style={{background: 'transparent', border: '1px solid #fff', padding: '5px', color: 'white', width: '80%'}}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onBlur={handleSaveNameP1}
                    />
                </div>

                <p className={styles.qrLegend}>
                  {isReadyToStart 
                    ? `¡${partnerName || "Tu pareja"} se ha conectado!` 
                    : "Pídele a tu pareja que escanee este código o envíale el enlace."}
                </p>

                {!isReadyToStart && (
                    <div className={styles.qrWrapper}>
                        <QRCode
                        value={generateSessionLink()}
                        size={200}
                        bgColor="#000000"
                        fgColor="#FFD700"
                        includeMargin={true}
                        />
                    </div>
                )}

                <a
                  href={generateSessionLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.qrLink}
                >
                  {generateSessionLink()}
                </a>
              </div>
            )}

            {/* --- ZONA P2: UNIRSE --- */}
            {joinAs === "p2" && (
                <div style={{marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    {/* Nota: En P2, isReadyToStart significa que ya se unió oficialmente. */}
                    {!isReadyToStart ? (
                        <>
                            <p className={styles.text}>Ingresa tu nombre para entrar:</p>
                            <input 
                                type="text" 
                                placeholder="Tu Nombre"
                                style={{
                                    padding: '10px', 
                                    borderRadius: '5px', 
                                    border: '1px solid #FFD700', 
                                    background: 'rgba(0,0,0,0.5)', 
                                    color: 'white',
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }}
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <button onClick={handleJoinP2} className={styles.ctaButton}>
                                UNIRME AL RITUAL
                            </button>
                        </>
                    ) : (
                        <p className={styles.text}>
                            Te has unido como <strong>{userName}</strong>.<br/>
                            Esperando a que el anfitrión inicie...
                        </p>
                    )}
                </div>
            )}

            <p className={styles.text} style={{marginTop: '20px'}}>
              Si das en comenzar ritual,{" "}
              <span className={styles.highlight}>TE COMPROMETES A CUMPLIR.</span>
            </p>

            <div className={styles.centerButton}>
              <button
                className={`${styles.ctaButton} ${
                  isReadyToStart ? styles.ctaActive : styles.ctaDisabled
                }`}
                onClick={handleStart}
                // P1 solo se activa si isReadyToStart es true
                // P2 siempre tiene el botón activo, porque el inicio lo fuerza P1
                disabled={joinAs === "p1" && !isReadyToStart} 
              >
                {joinAs === "p1" 
                    ? (isReadyToStart ? "COMENZAR RITUAL" : "ESPERANDO PAREJA...") 
                    : "COMENZAR RITUAL"
                }
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}