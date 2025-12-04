//src/app/productos/[categoria]/page.js


import Link from 'next/link'; 
import Image from 'next/image'; 
import { notFound } from 'next/navigation';
import styles from './ProductPage.module.css';
import data from '../../../data/leyendas.json';

// Mapeo de Colores por Slug (Punto 2 y 3)
const COLOR_MAP = {
  'tentacion': '#A52A2A',        // Rojo
  'pasion': '#CCCCCC',           // Plateado
  'deseo-prohibido': '#FFD700',  // Dorado
  'sorpresa': '#333333',         // Negro
};

// El array de productos se obtiene directamente del JSON
const PRODUCTS_DATA = data.products;

// Función principal del componente de página
export default function ProductPage({ params }) {
  // 1. Corregimos la búsqueda usando el nuevo slug 'deseo-prohibido' si es necesario
  const slug = params.categoria === 'deseo' ? 'deseo-prohibido' : params.categoria; 

  const product = PRODUCTS_DATA.find(p => p.slug === slug);

  if (!product) {
    // En caso de que el usuario aún tenga un enlace viejo de 'deseo' que no funciona,
    // lo redirigimos a la nueva URL correcta. (Esto es una mejora UX)
    if (params.categoria === 'deseo') {
         // Esto no es fácil de hacer sin hooks de Next, por ahora nos enfocamos en que funcione con el slug correcto.
    }

    // Buscamos el producto en base al slug (que ahora debe ser deseo-prohibido)
    const newProduct = PRODUCTS_DATA.find(p => p.slug === params.categoria);
    if (!newProduct) {
         notFound();
    }
  }

  const color = COLOR_MAP[slug] || '#FFFFFF'; // Color por defecto: blanco

  // Usamos el producto encontrado con el slug corregido o el original
  const finalProduct = product || PRODUCTS_DATA.find(p => p.slug === params.categoria);


  // 4. Renderiza la ficha del producto
  return (
    <main className={styles.productContainer}>
      <div className={styles.card}>
        {/* Cabecera y Tagline */}
        <h1 className={styles.name} style={{ color: color }}>{finalProduct.name}</h1> {/* << APLICAMOS COLOR AL NOMBRE >> */}
        <p className={styles.tagline}>{finalProduct.tagline}</p>

        {/* Imagen del Producto */}
        <div className={styles.imageWrapper}>
          <Image 
            src={finalProduct.image} 
            alt={finalProduct.name} 
            className={styles.productImage} 
            style={{ borderColor: color, boxShadow: `0 0 15px ${color}77` }} // << APLICAMOS COLOR AL MARCO >>
            width={300} 
            height={300} 
            priority
          />
        </div>

        {/* Descripción y Precio */}
        <p className={styles.description}>{finalProduct.description}</p>
        <p className={styles.price}>Precio: ${finalProduct.price} ARS</p>

        {/* Botón de Compra/CTA (con animación) */}
        <button className={`${styles.ctaButton} ${styles.ctaAnimation}`} 
                style={{ backgroundColor: color, animation: `pulseButton 1.5s infinite ${color}` }}>
          COMPRAR AHORA
        </button>

        {/* Enlace de regreso a Home */}
        <Link href="/" className={styles.backLink}>
          Volver a la Home
        </Link>
      </div>
    </main>
  );
}