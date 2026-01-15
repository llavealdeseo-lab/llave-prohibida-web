'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TestPage.module.css';

// PREGUNTAS DEL TEST: Diseñadas para extraer el "Arquetipo" (Profiling)
const QUESTIONS = [
    {
        id: 'gender',
        text: "¿Cómo te identificas?",
        options: [
            { label: "Masculino", value: "masculine" },
            { label: "Femenino", value: "feminine" },
            { label: "Otro / Prefiero no decir", value: "other" }
        ]
    },
    {
        id: 'dominance',
        text: "¿Quién suele tomar la iniciativa en los momentos de intimidad?",
        options: [
            { label: "Yo, me gusta tener el control", value: "active" },
            { label: "Mi pareja, me dejo llevar", value: "passive" },
            { label: "Ambos, varía según el momento", value: "versatile" }
        ]
    },
    {
        id: 'language',
        text: "Para ti, ¿qué gesto tiene más valor en este momento?",
        options: [
            { label: "Un detalle o regalo pensado", value: "gifts" },
            { label: "Palabras, susurros y confesiones", value: "words" },
            { label: "El contacto físico intenso", value: "touch" },
            { label: "Tiempo de calidad sin distracciones", value: "time" }
        ]
    },
    {
        id: 'daring',
        text: "Hoy, ¿qué tan lejos están dispuestos a llegar?",
        options: [
            { label: "Tranquilo y romántico", value: "conservative" },
            { label: "Curioso, probar algo nuevo pero seguro", value: "curious" },
            { label: "Sin límites, queremos intensidad máxima", value: "extreme" }
        ]
    },
    {
        id: 'atmosphere',
        text: "¿Qué escenario les excita más imaginar ahora?",
        options: [
            { label: "La privacidad absoluta de nuestro espacio", value: "private" },
            { label: "La adrenalina de un lugar público o arriesgado", value: "public" },
            { label: "Un ambiente de lujo y servicio", value: "luxury" }
        ]
    },
    {
        id: 'cost',
        text: "¿Qué 'moneda' están más dispuestos a gastar en este juego?",
        options: [
            { label: "Esfuerzo físico y creatividad", value: "effort" },
            { label: "Dinero (regalos, experiencias)", value: "money" },
            { label: "Vulnerabilidad emocional", value: "emotion" }
        ]
    }
];

export default function TestPage() {
    const router = useRouter();
    const [step, setStep] = useState('intro'); // intro, questions
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});

    const handleStart = () => {
        setStep('questions');
    };

    const handleAnswer = (value) => {
        const currentQ = QUESTIONS[currentQuestionIndex];
        const newAnswers = { ...answers, [currentQ.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishTest(newAnswers);
        }
    };

    const finishTest = (finalAnswers) => {
        const profileString = JSON.stringify(finalAnswers);
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId = searchParams.get('sessionId');
        const joinAs = searchParams.get('joinAs');
        const category = searchParams.get('category');

        localStorage.setItem('userProfile', profileString);

        router.push(`/eleccion-deseo?sessionId=${sessionId}&joinAs=${joinAs}&category=${category}&profile=completed`);
    };

    const handleSkip = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId = searchParams.get('sessionId');
        const joinAs = searchParams.get('joinAs');
        const category = searchParams.get('category');
        router.push(`/eleccion-deseo?sessionId=${sessionId}&joinAs=${joinAs}&category=${category}&profile=skipped`);
    };

    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>

                {step === 'intro' && (
                    <div className={styles.introCard}>
                        <h1 className={styles.title}>Antes de entrar...</h1>
                        <p className={styles.introText}>
                            Para que la experiencia sea verdaderamente memorable,
                            necesito entender quiénes son ustedes hoy.
                            <br /><br />
                            Responder estas 5 preguntas ayudará a que el juego
                            entienda sus límites y sus deseos ocultos.
                        </p>
                        <button onClick={handleStart} className={styles.startButton}>
                            Comenzar Test (1 min)
                        </button>
                        <button onClick={handleSkip} className={styles.skipButton}>
                            Saltar (Deseos Aleatorios)
                        </button>
                    </div>
                )}

                {step === 'questions' && (
                    <div className={styles.questionCard}>
                        {/* Progress */}
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                        </div>

                        <h2 className={styles.questionText}>
                            {QUESTIONS[currentQuestionIndex].text}
                        </h2>

                        <div className={styles.optionsGrid}>
                            {QUESTIONS[currentQuestionIndex].options.map((opt) => (
                                <button
                                    key={opt.value}
                                    className={styles.optionButton}
                                    onClick={() => handleAnswer(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
