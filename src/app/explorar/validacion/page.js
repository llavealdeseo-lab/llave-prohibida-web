// src/app/explorar/validacion/page.js

'use client'; 
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ValidationPage.module.css';
import data from '../../../data/leyendas.json';

// ⬅️ CRÍTICO: Importar el servicio de IA
import { iaService } from '@/services/iaService'; 

const PRODUCTS_DATA = data.products;
// ... (LEGEND y COLOR_MAP se mantienen iguales) ...
const LEGEND = "En llave prohibida no solo compras un chocolate. Esto va mas allá, compras una llave que te permitirá escribir un deseo que tu pareja deberá cumplir. Un deseo que se esconderá detrás de una de diez cartas, solo dos cartas ganaran y quizás, si seleccionas bien, tu deseo este en una de ellas. Pero ese deseo tiene sus riesgos. Tu pareja también podrá escribir el suyo y si decides jugar TE COMPROMETES A CUMPLIR. Lo bueno es que aquí los limites solo lo pone la llave que compraste, puedes pedir cosas sexuales, claro, pero no solo eso, también puedes pedir regalos, viajes, tecnologías (cada categoría tiene un límite de precios) y hasta puedes retar a tu pareja, a muchas cosas: a que te muestre alguna aplicación, a que escriba algo en sus estados, a hacerlo en un lugar prohibido. No lo sé, el límite está en tu imaginación y en la llave que elijas.Aquí puedes probar  deseos que quieres que tu pareja te cumpla, yo te diré qué chocolate contiene la llave, que quizás con suerte, te pueda ayudar a cumplirlo.";

// Mapeo de Colores por Slug 
const COLOR_MAP = {
  'tentacion': '#A52A2A',        // Rojo
  'pasion': '#CCCCCC',          // Plateado
  'deseo-prohibido': '#FFD700', // Dorado
  'sorpresa': '#333333',         // Negro (Oscuro)
};


export default function ValidationPage() {
  const [classifiedCategory, setClassifiedCategory] = useState(null); 
  const [userDesire, setUserDesire] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null); 
  // ⬅️ NUEVO ESTADO: Para el botón de la IA
  const [isClassifying, setIsClassifying] = useState(false);

  const currentProductSlug = classifiedCategory || hoveredCategory;
  const currentProduct = PRODUCTS_DATA.find(p => p.slug === currentProductSlug);

  // 🛑 MODIFICACIÓN CRÍTICA: Llamada a la IA
  const handleValidation = async (e) => { // Debe ser async
    e.preventDefault();
    
    const desireText = userDesire.trim();

    if (desireText === '') {
      setClassifiedCategory(null);
      return;
    }

    setIsClassifying(true); // Inicia el spinner/estado
    setClassifiedCategory(null); // Limpiamos la clasificación anterior

    try {
        // 1. La IA CLASIFICA el deseo y nos devuelve la categoría (Ej: PASION)
        // Usamos el mismo estándar de mayúsculas que la DB: TENTACION, PASION, DESEO_PROHIBIDO
        const resultCategory = await iaService.classifyDesireForExploration(desireText); 

        if (resultCategory) {
            // Transformamos el resultado a slug (minúsculas, guion)
            const slug = resultCategory.toLowerCase().replace('_', '-'); 
            setClassifiedCategory(slug);
        } else {
            // Fallback si la IA no responde correctamente, por ejemplo, Sorpresa
            setClassifiedCategory('sorpresa');
        }

    } catch (error) {
        console.error("Error clasificando deseo con IA:", error);
        // Fallback en caso de error de conexión
        setClassifiedCategory('sorpresa'); 
    } finally {
        setIsClassifying(false); // Termina el spinner/estado
    }
  };
  
  // ... (handleDesireChange se mantiene igual) ...
  const handleDesireChange = (e) => {
    const value = e.target.value;
    setUserDesire(value);

    // Si el campo queda vacío, reiniciamos el estado de clasificación
    if (value.trim() === '') {
        setClassifiedCategory(null);
    }
  };


  // ... (getProductClass se mantiene igual) ...
  const getProductClass = (slug) => {
    let classes = styles.productCard;
    const isClassified = classifiedCategory === slug;
    
    // 1. El chocolate clasificado brilla
    if (isClassified) {
      classes += ` ${styles.highlighted}`;
    } 
    
    // 2. Si hay una clasificación, los NO clasificados se atenúan
    //    PERO NUNCA ATENUAMOS SORPRESA
    else if (classifiedCategory && classifiedCategory !== slug && slug !== 'sorpresa') { 
        classes += ` ${styles.attenuated}`;
    }
    
    // 3. Sorpresa siempre a color, incluso cuando no es el clasificado
    if (slug === 'sorpresa') {
          // Ya es a color por defecto, la clase 'attenuated' es la única que lo atenuaría, y la bloqueamos arriba.
    }

    return classes;
  };


  return (
    <main className={styles.validationContainer}>
      
      <Link href="/" className={styles.backLink}>
        ← Volver a la Home
      </Link>
      
      <div className={styles.contentArea}>
        
        {/* Campo de Validación de Deseo */}
        <h1 className={styles.mainLegend}>{LEGEND}</h1>
        
        <form onSubmit={handleValidation} className={styles.desireForm}>
          <input
            type="text"
            value={userDesire}
            onChange={handleDesireChange} 
            placeholder="Escribe aquí tu deseo..."
            className={styles.desireInput}
            disabled={isClassifying} // ⬅️ Deshabilitamos mientras clasifica
          />
          <button 
            type="submit" 
            className={styles.validateButton}
            disabled={isClassifying || userDesire.trim() === ''} // ⬅️ Deshabilitamos cuando clasifica o está vacío
          >
            {/* ⬅️ CRÍTICO: Texto dinámico */}
            {isClassifying ? 'CLASIFICANDO DESEO...' : 'QUE CHOCOLATE PERMITE PEDIR EL DESEO'}
          </button>
        </form>

        {/* Mensaje de Clasificación */}
        {classifiedCategory && (
            <p className={styles.classificationMessage}>
                ¡Listo! Tu deseo pertenece a la categoría **{PRODUCTS_DATA.find(p => p.slug === classifiedCategory)?.name}** (intensidad {classifiedCategory === 'tentacion' ? 'baja' : classifiedCategory === 'pasion' ? 'intermedia' : 'alta'}).
            </p>
        )}
        
        {/* ... (Resto del componente se mantiene EXACTAMENTE igual) ... */}
        <div className={styles.productsGrid}>
          {PRODUCTS_DATA.map((product) => {
              const color = COLOR_MAP[product.slug];
              
              return (
                <Link 
                    key={product.slug} 
                    href={`/productos/${product.slug}`} 
                    className={getProductClass(product.slug)}
                    // Aplicación del color en marco y globo
                    style={{'--product-color': color}} 
                    onMouseEnter={() => setHoveredCategory(product.slug)}
                    onMouseLeave={() => setHoveredCategory(null)}
                >
                  
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={250}
                    height={250}
                    className={styles.productImage}
                  />
                  <p className={styles.productName}>{product.name}</p>
                </Link>
              );
          })}
        </div>

        {/* Descripción Detallada al Seleccionar */}
        {currentProduct && (
            <div className={styles.detailedDescriptionArea}>
                <h2 className={styles.descriptionTitle} style={{color: COLOR_MAP[currentProductSlug]}}>
                    {currentProduct.name}
                </h2>
                <p className={styles.descriptionText}>
                    {currentProduct.validatorDescription}
                </p>
                <p className={styles.inspirationTitle}>
                    Te dejo algunos deseos que te pueden inspirar:
                </p>
                <ul className={styles.inspirationList}>
                    {currentProduct.validatorInspiration.map((desire, index) => (
                        <li key={index} style={{'--product-color': COLOR_MAP[currentProductSlug]}}>{desire}</li>
                    ))}
                </ul>
            </div>
        )}
        
      </div>
    </main>
  );
}