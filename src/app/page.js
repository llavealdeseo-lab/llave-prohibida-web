import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import ProductsTab from '@/components/products/ProductsTab.jsx';
import data from '../data/leyendas.json'; // << NUEVA IMPORTACIÓN DE LEYENDAS >>

export default function Home() {
  const videoDesktop = '/videos/export/desktop/hero_desktop.mp4';
  const logoPath = '/icons/export/logo_llaveprohibida_.svg'; 

  // Se obtienen las leyendas desde el archivo JSON
  const LEYENDA_1 = data.home.legend1;
  const LEYENDA_2 = data.home.legend2;

  return (
    <main className={styles.homeContainer}>
      {/* Video de Fondo */}
      <video autoPlay loop muted playsInline className={styles.heroVideo}>
        <source src={videoDesktop} type="video/mp4" />
      </video>

      {/* Capa de Contenido */}
      <section className={styles.contentOverlay}>

        {/* Pestaña Productos */}
        <ProductsTab /> 

        {/* Logo Centrado */}
        <div className={styles.centeredLogoArea}>
            <Image
                src={logoPath}
                alt="Logo Llave Prohibida"
                width={450} 
                height={450} 
                priority 
            />
        </div>

        {/* Contenido Principal (Leyendas y Botón) */}
        <div className={styles.ctaArea}>

          {/* Leyenda 1 */}
          <p className={styles.legend1}>
            {LEYENDA_1}
          </p>

          {/* Botón de Explorar con Animación */}
          <Link href="/explorar/validacion" className={styles.ctaButton}> {/* << RUTA ACTUALIZADA >> */}
          Explora chocolates
          </Link>
          {/* Leyenda 2 */}
          <p className={styles.legend2}>
            {LEYENDA_2}
          </p>
        </div>

        {/* Espacio para la responsividad */}
        <div style={{height: '30px'}}></div>
      </section>
    </main>
  );
}