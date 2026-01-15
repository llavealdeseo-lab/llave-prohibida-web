// src/app/eleccion-deseo/EleccionContent.jsx
// ESTE ARCHIVO ES EL CLIENTE Y CONTIENE TODA LA LÓGICA

"use client"; // <--- ESTO ES CRÍTICO

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./EleccionDeseoPage.module.css";
import { supabase } from "@/lib/supabaseClient";
import { iaService } from "@/services/iaService";

// DEFAULTS: Sugerencias basadas en características (Físico, Emocional, Monetario)
const DEFAULT_SUGGESTIONS = {
    'PASION': [
        { title: "Una sesión de baile erótico privado", description: "Físico e íntimo." },
        { title: "Publicar una foto nuestra con una dedicatoria romántica", description: "Carga emocional y pública." },
        { title: "Una noche de hotel de lujo pagada por ti", description: "Monetario y experiencial." },
        { title: "Organiza una cena gourmet en casa con velas", description: "Experiencial y de servicio." },
        { title: "Masaje de cuerpo completo con aceites", description: "Físico y de relajación." },
    ],
    'TENTACION': [
        { title: "Maratón de series todo el día abrazados", description: "Un deseo simple y de conexión." },
        { title: "Desayuno en la cama con café recién hecho", description: "Servicio matutino." },
        { title: "Un viaje espontáneo de fin de semana", description: "Aventura ligera." },
        { title: "Una hora de conversación sin móviles", description: "Conexión profunda." },
        { title: "Un día entero libre de responsabilidades de casa", description: "Servicio y descanso." },
    ],
    'DESEO_PROHIBIDO': [
        { title: "Intercambio de roles por 24 horas (completo)", description: "Control y sumisión." },
        { title: "Una sesión de bondage y juegos de rol intensos", description: "Físico y tabú." },
        { title: "Tener un trío o invitar a un tercero a casa", description: "Social y límite extremo." },
        { title: "Compartir un fetiche sexual secreto", description: "Emocional y de confianza extrema." },
        { title: "Experimentar con juguetes sexuales nuevos", description: "Físico y exploración." },
    ]
};

const getCategoryDefaults = (cat) => {
    return DEFAULT_SUGGESTIONS[cat] ? DEFAULT_SUGGESTIONS[cat].slice(0, 5) : [];
}

// CAMBIO AQUÍ: Renombra la función principal
export default function EleccionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL Params
    const sessionId = searchParams.get("sessionId") || searchParams.get("session");
    const joinAs = (searchParams.get("joinAs") || searchParams.get("role") || "P1").toUpperCase();
    const categoryParam = (searchParams.get("category") || "PASION").toUpperCase();

    const [category, setCategory] = useState(categoryParam);
    const [desire, setDesire] = useState("");
    const [status, setStatus] = useState("neutral");
    const [feedback, setFeedback] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [sessionExists, setSessionExists] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [desireScore, setDesireScore] = useState(0);
    const [sessionData, setSessionData] = useState(null); // <--- NUEVO ESTADO PARA LA LÓGICA

    // 1. Cargar datos de la sesión y sugerencias
    useEffect(() => {
        if (!sessionId) {
            setSessionExists(false);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            // A. Cargar datos de la sesión desde Supabase
            const { data, error } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error || !data) {
                setSessionExists(false);
                setLoading(false);
                return;
            }

            setSessionExists(true);
            setSessionData(data); // <--- GUARDAR EN ESTADO
            const activeCategory = data.category.toUpperCase();
            setCategory(activeCategory);

            // Pre-cargar deseo si ya existe
            const playerState = joinAs === 'P1' ? data.p1_state : data.p2_state;
            if (playerState?.desire) {
                setDesire(playerState.desire);
                setStatus("valid");
                setDesireScore(playerState.score || 0); // Cargar score existente
                setFeedback("✅ Tu deseo ya fue guardado. Puedes modificarlo si lo deseas.");
            }

            // B. Cargar Sugerencias de la IA/Curación DB
            let fetchedSuggestions = await iaService.getSuggestions(activeCategory);

            // Lógica de Fallback
            if (!fetchedSuggestions || fetchedSuggestions.length === 0 || fetchedSuggestions.every(s => s.description.includes('Fallo de conexión'))) {
                fetchedSuggestions = getCategoryDefaults(activeCategory);
            }

            setSuggestions(fetchedSuggestions);
            setLoading(false);
        };

        fetchData();
    }, [sessionId, joinAs]);

    // 2. Reset de estado al vaciar el input
    useEffect(() => {
        if (desire.trim() === "") {
            setStatus("neutral");
            setFeedback("");
            setDesireScore(0);
        }
    }, [desire]);

    const handleValidate = async () => {
        const text = (desire || "").trim();
        if (!text) {
            setFeedback("Por favor, escribe un deseo antes de validar.");
            setStatus("neutral");
            return;
        }

        setIsValidating(true);
        setDesireScore(0); // Reiniciar score antes de la nueva validación

        try {
            // Buscamos el nombre local para personalizar el susurro
            const myName = localStorage.getItem('userName') || (joinAs === 'P1' ? 'Jugador 1' : 'Jugador 2');

            // Intentamos obtener el deseo de la pareja si ya existe en la sesión
            const partnerName = joinAs === 'P1' ? 'p2' : 'p1';
            const partnerDesire = sessionData?.[`${partnerName}_state`]?.desire || null;

            // Obtenemos el perfil completo para la IA
            const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

            // 1. Validar la categoría y obtener el resultado inicial (aprobado/rechazado)
            const result = await iaService.validateDesire(text, category, myName, partnerDesire, userProfile);

            let score = 0;
            let newStatus = 'REJECTED'; // Status por defecto si es rechazado

            if (result.isApproved || result.isLowerCategory) {
                // 2. Si es APROBADO o UNDER, obtener el score (ESTO SOLUCIONA EL ERROR: "No hay score")
                score = await iaService.getDesireScore(text);
                setDesireScore(score); // Establecer el score en el estado

                // 3. Establecer el status de la UI y el feedback
                if (result.isLowerCategory) {
                    setStatus("under");
                } else {
                    setStatus("valid");
                }

                setFeedback(result); // Guardamos el objeto completo {isApproved, isLowerCategory, message, aiWhisper}
                newStatus = 'VALIDATED'; // Estado para guardar en la DB

            } else {
                // 4. Deseo RECHAZADO
                setStatus("invalid");
                setFeedback(result);
                newStatus = 'REJECTED'; // Estado para guardar en la DB
            }

            // 5. Lógica CRÍTICA: Guardar el deseo en el historial CON EL STATUS correcto.
            await iaService.saveDesireStatus({
                desireTitle: text,
                desireCategory: category,
                score: score,
                newStatus: newStatus
            });

        } catch (e) {
            console.error("validate error", e);
            // Fallback: Aprobamos con un score por defecto para no bloquear el juego
            const fallbackResult = {
                isApproved: true,
                isLowerCategory: false,
                message: "Aceptado por el destino.",
                aiWhisper: "La conexión es débil, pero mi voluntad por verte cumplir esto es fuerte."
            };
            setFeedback(fallbackResult);
            setStatus("valid");
            setDesireScore(8); // Score neutro (PASION) por defecto en caso de error

            await iaService.saveDesireStatus({
                desireTitle: text,
                desireCategory: category,
                score: 8,
                newStatus: 'VALIDATED'
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleConfirm = async () => {
        // Ahora verificamos que el score exista en el estado (soluciona la validación)
        if (!(status === "valid" || status === "under") || desireScore === 0) {
            if (desireScore === 0) setFeedback("❌ Error: No hay score, valida nuevamente.");
            return;
        }

        const text = (desire || "").trim();
        if (!text) return;

        try {
            const playerKey = joinAs === 'P1' ? 'p1_state' : 'p2_state';

            // 1. Actualizar el estado del deseo a CONFIRMED en el historial
            await iaService.saveDesireStatus({
                desireTitle: text,
                desireCategory: category,
                score: desireScore, // Usamos el score del estado (ya validado)
                newStatus: 'CONFIRMED'
            });

            // 2. GUARDAR el score y deseo en la sesión de juego (game_sessions)
            const { data: currentData } = await supabase
                .from('game_sessions')
                .select(`${playerKey}`)
                .eq('id', sessionId)
                .single();

            if (!currentData) throw new Error("No se pudo obtener el estado actual para guardar el deseo.");

            const currentPState = currentData[playerKey];
            const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

            const updatePayload = {
                [playerKey]: {
                    ...currentPState,
                    desire: text,
                    desire_category: category,
                    score: desireScore, // Usamos el score del estado (ya validado)
                    profile: userProfile // <--- GUARDAMOS EL PERFIL AQUÍ
                }
            };

            const { error: sessionError } = await supabase
                .from('game_sessions')
                .update(updatePayload)
                .eq('id', sessionId);

            if (sessionError) throw sessionError;

            // 3. Redirección
            setFeedback("✨ Deseo confirmado. Vamos al juego de cartas...");
            router.push(`/juego-cartas?session=${sessionId}&role=${joinAs}`);
        } catch (e) {
            console.error("save error", e);
            setFeedback("❌ Error al confirmar. Intenta nuevamente.");
        }
    };

    const applySuggestion = (s) => {
        setDesire(s);
        setStatus("neutral");
        setFeedback("");
        setDesireScore(0);
    };

    // Colores por categoria (usados en clases dinámicas)
    const categoryColors = {
        TENTACION: styles.tentacion,
        PASION: styles.pasion,
        DESEO_PROHIBIDO: styles.prohibido,
    };
    const catClass = categoryColors[category] || styles.pasion;

    if (loading) return <div className={styles.loadingScreen}><p>Conectando con la IA...</p></div>;
    if (!sessionId) return <div className={styles.loadingScreen}><p>Error: Falta ID de sesión.</p></div>;

    return (
        <main className={`${styles.theme} ${styles.main} ${catClass}`}>

            <div className={styles.container}>
                <h1 className={styles.title}>Elegí tu deseo</h1>

                {!sessionExists && (
                    <div className={styles.warnBox}>
                        ⚠️ Atención: No se encontró sesión activa con ID **{sessionId}** en la Nube. Asegúrate de iniciar desde Invitación Ritual.
                    </div>
                )}

                {/* --- CAMBIO A ESTÉTICA MÁS COMPACTA --- */}
                <p className={styles.legend}>
                    Aquí puedes probar deseos que quieres que tu pareja te cumpla.
                    <br />
                    <span className={styles.highlight}>Yo te diré si entra en la categoría de tu llave.</span>
                </p>

                <div className={styles.inputArea}>
                    <textarea
                        className={`${styles.textarea} ${status === "valid"
                            ? styles.inputValid
                            : status === "under"
                                ? styles.inputUnder
                                : status === "invalid"
                                    ? styles.inputInvalid
                                    : ""
                            }`}
                        placeholder="Escribe tu deseo..."
                        value={desire}
                        onChange={(e) => setDesire(e.target.value)}
                    />

                    {/* AI WHISPER: El comentario de la IA Intermediaria */}
                    {feedback && (
                        <div className={styles.feedbackWrapper}>
                            {status !== "neutral" && (
                                <p className={styles.aiWhisper}>
                                    <em>" {feedback.aiWhisper || 'Interesante elección...'} "</em>
                                </p>
                            )}
                            <p
                                className={`${styles.feedback} ${status === "valid"
                                    ? styles.validText
                                    : status === "under"
                                        ? styles.underText
                                        : styles.invalidText
                                    }`}
                            >
                                {feedback.message || feedback}
                            </p>
                        </div>
                    )}

                    <div className={styles.buttonsRow}>
                        <button
                            onClick={handleValidate}
                            className={`${styles.btn} ${styles.validateBtn}`}
                            aria-label="Validar deseo"
                            disabled={isValidating}
                        >
                            {isValidating ? 'VALIDANDO CON IA...' : 'VALIDAR'}
                        </button>

                        <button
                            onClick={handleConfirm}
                            className={`${styles.btn} ${styles.confirmBtn} ${status === "valid" || status === "under" ? styles.activeBtn : styles.disabledBtn
                                }`}
                            disabled={!(status === "valid" || status === "under")}
                        >
                            CONFIRMAR DESEO
                        </button>
                    </div>
                </div>
                <section className={styles.suggestions}>
                    <p className={styles.subTitle}>Aquí te dejo unos deseos de tu categoría para que te inspires:</p>
                    <div className={styles.suggestionGrid}>
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                className={styles.suggestionCard}
                                onClick={() => applySuggestion(s.title)}
                                title={s.description}
                            >
                                <strong className={styles.suggTitle}>{s.title}</strong>
                                <span className={styles.suggDesc}>{s.description}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <footer className={styles.footer}>
                    <small>Sesión: <strong>{sessionId}</strong> — Jugador: <strong>{joinAs}</strong> — Categoría: <strong>{category}</strong></small>
                </footer>
            </div>
        </main>
    );
}