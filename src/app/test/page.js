// src/app/test/page.js
'use client'; 
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './TestPage.module.css';

// Definición de las 6 preguntas con puntajes
const QUESTIONS = [
    {
        id: 1,
        q: "¿Qué tan fácil es para ti compartir una fantasía que aún no han cumplido?",
        options: [
            { text: "Muy fácil", score: 3 },
            { text: "Un poco difícil", score: 2 },
            { text: "Imposible", score: 1 },
        ],
    },
    {
        id: 2,
        q: "Cuando su pareja toma la iniciativa en la intimidad, su reacción es:",
        options: [
            { text: "Activa y aventurada", score: 3 },
            { text: "Receptiva, pero reservada", score: 2 },
            { text: "Prefiero yo tener el control", score: 1 },
        ],
    },
    {
        id: 3,
        q: "¿Con qué frecuencia discuten sus límites y deseos sexuales?",
        options: [
            { text: "Frecuentemente, tenemos confianza", score: 3 },
            { text: "A veces, si el tema surge", score: 2 },
            { text: "Nunca, lo evitamos", score: 1 },
        ],
    },
    {
        id: 4,
        q: "El secreto más grande que he guardado de mi pareja tiene que ver con:",
        options: [
            { text: "Cosas pequeñas, sin importancia", score: 3 },
            { text: "Mis miedos o inseguridades", score: 2 },
            { text: "Mis deseos más audaces", score: 1 },
        ],
    },
    {
        id: 5,
        q: "¿Estarías dispuesto(a) a participar en un juego de rol 'extremo' si tu pareja lo propusiera?",
        options: [
            { text: "Sí, sin dudarlo", score: 3 },
            { text: "Lo pensaría mucho, pero probablemente sí (2)", score: 2 },
            { text: "Definitivamente no", score: 1 },
        ],
    },
    {
        id: 6,
        q: "¿Cuál es su nivel de compromiso emocional para enfrentar cualquier desafío juntos?",
        options: [
            { text: "Totalmente inquebrantable", score: 3 },
            { text: "Muy fuerte, pero hay dudas", score: 2 },
            { text: "Estable, pero con cautela", score: 1 },
        ],
    },
];

const MAX_SCORE = QUESTIONS.length * 3; 

export default function TestPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // ESTADOS DEL JUGADOR ACTUAL
    const [answers, setAnswers] = useState({}); 
    const [testSkipped, setTestSkipped] = useState(false); 

    // ESTADOS DE LA SESIÓN
    const [qrCode, setQrCode] = useState(null); 
    const [partnerReady, setPartnerReady] = useState(false); // Simulación de compañero listo

    // ----------------------------------------------------
    // Lógica de Inicialización y Simulación del Compañero
    // ----------------------------------------------------
    useEffect(() => {
        const currentQrCode = searchParams.get('qr');
        if (currentQrCode) {
            setQrCode(currentQrCode);
        } else {
            // Si no hay QR, redirigir a inicio
            router.push('/');
            return;
        }

        // SIMULACIÓN DE FINALIZACIÓN DEL COMPAÑERO: 
        // El compañero siempre toma una decisión a los 3 segundos
        const partnerTimer = setTimeout(() => {
             setPartnerReady(true);
        }, 3000); 

        return () => clearTimeout(partnerTimer);
    }, [router, searchParams]);


    // ----------------------------------------------------
    // Función de Finalización y Redirección
    // ----------------------------------------------------
    const handleFinalizeTest = (skipped = false) => {
        if (!qrCode) return;

        let finalResult = 'skipped';
        
        if (!skipped) {
            // 1. Calcular puntaje y perfil (Lógica MVP simple)
            const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
            
            if (totalScore >= MAX_SCORE * 0.75) {
                finalResult = 'audaz';
            } else if (totalScore >= MAX_SCORE * 0.5) {
                finalResult = 'apasionado';
            } else {
                finalResult = 'cauteloso';
            }
        }
        
        // 2. Redirigir a Elección de Deseo, pasando el QR y el resultado del Test
        router.push(`/eleccion-deseo?qr=${qrCode}&testResult=${finalResult}`);
    };


    // ----------------------------------------------------
    // Manejadores del Test
    // ----------------------------------------------------
    const handleAnswer = (questionId, score) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: score
        }));
    };
    
    const handleSkipTest = () => {
        setTestSkipped(true);
        
        // Si el compañero ya está listo, finalizamos inmediatamente.
        if (partnerReady) {
            handleFinalizeTest(true);
        }
    };
    
    // ----------------------------------------------------
    // Cálculo de Estados
    // ----------------------------------------------------
    const isTestComplete = Object.keys(answers).length === QUESTIONS.length;
    // Se puede avanzar si: (Test Completo Y Compañero Listo) O (Test Saltado Y Compañero Listo)
    const isCtaReady = (isTestComplete || testSkipped) && partnerReady;
    
    // LEYENDAS (Aparecen según el estado)
    let statusLegend = "";
    if (qrCode === null) {
        statusLegend = "Cargando sesión...";
    } else if (isTestComplete && !partnerReady) {
        statusLegend = "¡Tu Test está completo! Esperando que tu pareja finalice el suyo...";
    } else if (isTestComplete && partnerReady) {
        const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
        statusLegend = `¡Ambos Test completados! Su nivel de intimidad (puntaje simulado: ${totalScore}/${MAX_SCORE}) es compatible. Están listos para el Ritual.`;
    } else if (testSkipped && !partnerReady) {
        statusLegend = "Has decidido saltar el Test. Esperando que tu pareja tome una decisión...";
    } else if (testSkipped && partnerReady) {
        statusLegend = "Ambos están listos. El sistema usará deseos aleatorios adaptados solo a la categoría del chocolate. ¡Vamos a elegir su deseo!";
    } else {
        statusLegend = "Tu respuesta es la clave: La IA utilizará tus respuestas para generar 4 deseos personalizados en el mazo de cartas (los 4 deseos de tu pareja serán personalizados para su perfil). Si decides saltar el Test, el sistema usará deseos aleatorios de la categoría. **Ambos deben completar el Test o decidir saltarlo para continuar.**";
    }
    
    
    return (
        <main className={styles.testContainer}>
            <video autoPlay loop muted playsInline className={styles.heroVideo}>
                <source src="/videos/export/desktop/hero_desktop.mp4" type="video/mp4" />
            </video>
    
            <section className={styles.contentOverlay}>
                <div className={styles.contentArea}>
    
                    <h1 className={styles.testTitle}>TEST DE COMPROMISO RITUAL</h1>
                    {/* Información de Sesión */}
                    <p className={styles.sessionInfo}>Sesión QR: **{qrCode || 'Cargando...'}**</p> 
                    <p className={styles.testLegend} dangerouslySetInnerHTML={{ __html: statusLegend }} />
    
                    {/* 6 Preguntas */}
                    {/* Solo mostramos las preguntas si el test NO ha sido saltado Y no se ha terminado */}
                    {!testSkipped && !isTestComplete && qrCode && (
                        <div className={styles.questionsWrapper}>
                            {QUESTIONS.map((qData) => (
                                <div key={qData.id} className={styles.questionCard}>
                                    <div className={styles.questionText}> 
                                        **{qData.id}.** {qData.q}
                                    </div>
                                    <div className={styles.optionsContainer}>
                                        {qData.options.map((option) => (
                                            <button
                                                key={option.score}
                                                onClick={() => handleAnswer(qData.id, option.score)}
                                                className={[
                                                    styles.optionButton,
                                                    answers[qData.id] === option.score ? styles.selected : ''
                                                ].join(' ')} 
                                                disabled={isTestComplete} 
                                            >
                                                {option.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
    
    
                    {/* Botón de Desbloqueo y Botón Saltar */}
                    <div className={styles.ctaWrapper}>
                        {/* Botón Principal (Llama a handleFinalizeTest) */}
                        <button 
                            onClick={() => handleFinalizeTest(testSkipped)} 
                            className={[
                                styles.ctaButton, 
                                isCtaReady ? styles.ready : styles.disabled
                            ].join(' ')}
                            disabled={!isCtaReady}
                        >
                            ELEGIR DESEO
                        </button>
    
                        {/* Botón Opcional SALTAR TEST */}
                        {!isTestComplete && !testSkipped && (
                            <button
                                onClick={handleSkipTest}
                                className={styles.skipButton}
                            >
                                SALTA EL TEST (Usar deseos aleatorios)
                            </button>
                        )}
    
                        <p className={styles.finalNote}>
                            (El botón **ELEGIR DESEO** se desbloquea cuando ambos deciden continuar)
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}