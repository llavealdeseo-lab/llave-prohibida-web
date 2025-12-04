import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import styles from './QrPage.module.css'; // Crearemos este archivo CSS
import data from '../../../data/leyendas.json'; // Leyendas y datos de productos

// Mapeo de Colores por Slug 
const COLOR_MAP = {
  'tentacion': '#A52A2A',        // Rojo
  'pasion': '#CCCCCC',           // Plateado
  'deseo-prohibido': '#FFD700',  // Dorado
  'sorpresa': '#333333',         // Negro
};

// Leyendas específicas para el Modo Juego
const GAME_LEGENDS = {
  'tentacion': "La llave está en tu mano. El ritual de Tentación desbloqueará los primeros secretos de la pasión. ¿Estás listo para el inicio?",
  'pasion': "La conexión entre ustedes es intensa. El ritual de Pasión exige valentía para explorar deseos que solo tú conoces. El camino empieza aquí.",
  'deseo-prohibido': "Están en la cumbre del compromiso. El ritual de Deseo Prohibido es solo para las almas más audaces. No hay vuelta atrás.",
  'sorpresa': "Una aventura inesperada les espera. El ritual Sorpresa te llevará a un camino nuevo, lleno de misterio y descubrimiento. Abre tu mente.",
};

// La URL de destino del botón CTA es fija por ahora, según el documento maestro.
const CTA_LINK = "/invitacion-ritual";

export default function QrPage({ params }) {
  // El ID es el slug del producto (ej: tentacion)
  const slug = params.id;

  // Manejamos el caso de la URL antigua "deseo" si llega a persistir
  const productSlug = slug === 'deseo' ? 'deseo-prohibido' : slug;

  const productData = data.products.find(p => p.slug === productSlug);

  if (!productData) {
    notFound();
  }

  const color = COLOR_MAP[productSlug] || '#A52A2A'; 
  const gameLegend = GAME_LEGENDS[productSlug] || GAME_LEGENDS['tentacion'];
  const logoPath = '/icons/export/logo_llaveprohibida_.svg'; 

  return (
    <main className={styles.qrContainer} style={{ borderColor: color }}> 
      <video autoPlay loop muted playsInline className={styles.heroVideo}>
        <source src="/videos/export/desktop/hero_desktop.mp4" type="video/mp4" />
      </video>

      <section className={styles.contentOverlay}>
          {/* Logo más chico, arriba a la derecha */}
          <div className={styles.logoArea}>
              <Image
                  src={logoPath}
                  alt="Logo Llave Prohibida"
                  width={150} 
                  height={150} 
                  priority 
              />
          </div>

          {/* Contenido Central */}
          <div className={styles.ctaArea}>

            {/* Nombre del Ritual */}
            <h1 className={styles.ritualName} style={{ color: color }}>
              RITUAL DE {productData.name.toUpperCase()}
            </h1>

            {/* Leyenda personalizada según categoría */}
            <p className={styles.legend}>
              {gameLegend}
            </p>

            {/* Botón CTA: "COMENZAR EL RITUAL" */}
            <Link href={CTA_LINK} 
                  className={`${styles.ctaButton} ${styles.ctaAnimation}`}
                  style={{ backgroundColor: color }}>
              COMENZAR EL RITUAL
            </Link>

          </div>
      </section>
    </main>
  );
}