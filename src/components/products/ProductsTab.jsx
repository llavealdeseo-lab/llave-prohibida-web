//src/components/products/productsTab.jsx

'use client'; // Esto le dice a Next.js que este componente usa interactividad del cliente

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductsTab.module.css'; // Crearemos este archivo en el siguiente paso

// Los datos de los 4 chocolates, extraídos del documento maestro.
// **RUTAS CORREGIDAS** usando la estructura: /mockups/export/desktop/mockup_CATEGORIA_tapasola.jpg
const products = [
  { name: 'Tentación', image: '/mockups/export/desktop/mockup_tentacion_recuadro.jpg', link: '/productos/tentacion' },
  { name: 'Pasión', image: '/mockups/export/desktop/mockup_pasion_recuadro.jpg', link: '/productos/pasion' },
  { name: 'Deseo Prohibido', image: '/mockups/export/desktop/mockup_deseo_recuadro.jpg', link: '/productos/deseo-prohibido' }, // << FIX DE NOMBRE Y SLUG >>
  { name: 'Sorpresa', image: '/mockups/export/desktop/mockup_sorpresa_recuadro.jpg', link: '/productos/sorpresa' }, 
];

const ProductsTab = () => {
  // ... (el resto del código se mantiene igual)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={styles.container}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className={styles.tab}>
        <p>PRODUCTOS</p>
      </div>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <p className={styles.menuTitle}>Elige tu ritual</p>
          {products.map((product) => (
            <Link href={product.link} key={product.name} className={styles.menuItem}>
              <Image
                src={product.image}
                alt={product.name}
                width={50}
                height={50}
                priority
              />
              <span>{product.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;