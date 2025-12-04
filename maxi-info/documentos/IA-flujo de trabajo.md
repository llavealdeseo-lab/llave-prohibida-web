# FLUJO DE TRABAJO:

Acá tenemos que colocar todo lo estamos trabajando con la IA. lo que queda definido y los archivos creado y para que se crearon esos archivos. tenemos que colocar todo lo que se va haciendo y porque.





#### a)lo que se hizo:

⦁	se creo la carpeta app en llave-prohibida/src/

⦁	Limpiando Estilos Globales. Se borro el contenido de globals.css que se ubicaba en: llave-prohibida/src/styles/ globals.css. Next.js por defecto añade muchos estilos (márgenes, fuentes) que no necesitamos. Vamos a limpiar el archivo de estilos para empezar desde cero.

y se creo:

⦁	Creamos un nuevo archivo para centralizar la lógica de las categorías, los colores, las palabras clave para la IA y los ejemplos más populares (simulación de datos de la IA). llave-prohibida/src/data/chocolateData.js



a).1.Diseño de la Home (Modo Exploración, sin QR)

a).1.1. home

llave-prohibida/src/app/page.js se creo el archivo page.js

llave-prohibida/src/app/ page.module.css

9.1.2 home/Producto

Creando el Componente del Menú Desplegable para darle funcionalidad a la pestaña de "Productos"

⦁	src/components/Products/ProductsTab.jsx

⦁	src/components/Products/ProductsTab.module.css

a).1.3 home/Product/ficha individual de productos

El objetivo es que al hacer clic en un chocolate del menú, el usuario sea redirigido a una URL como /productos/tentacion o /productos/sorpresa, y que la página cargue los datos correctos para ese producto. Esto se logra con el enrutamiento dinámico de Next.js.

⦁	src/app/productos/\[categoria]/page.js

⦁	src/app/productos/\[categoria]/ProductPage.module.css

a).1.4 home/Implementación del Simulador de Deseos

El objetivo es crear la pantalla /explorar/validacion donde los usuarios sin QR puedan escribir un deseo y ver a qué categoría de chocolate pertenece.

Ahora, creamos la página donde estará el simulador de deseos.

⦁	src/app/explorar/validacion/page.js

⦁	src/app/explorar/validacion/ValidationPage.module.css(creamos los estilos para esta nueva página, incluyendo los efectos de resaltado)







## 📘 DOCUMENTACIÓN MAESTRA: PROYECTO LLAVE PROHIBIDA

Estado: Funcional / MVP Integrado con IA y Base de Datos Fecha: Actualizado a la integración de Supabase y Gemini AI



#### 1\. Objetivo del Sistema

Crear una experiencia híbrida (Web + Físico) donde un código QR único en un chocolate permite a una pareja acceder a un "Ritual" (Juego de Cartas).



Modo Exploración (Público): Atracción de clientes, simulador de deseos con IA para recomendar productos.



Modo Juego (Privado): Acceso exclusivo vía QR. Sincronización en tiempo real entre dos dispositivos (P1 y P2), validación de deseos por IA y generación de contenido personalizado.



##### 2\. Arquitectura Técnica

###### 2.1 Stack Tecnológico

Frontend: Next.js (App Router).



Base de Datos \& Realtime: Supabase (PostgreSQL). Reemplazó al localStorage para la gestión crítica de sesiones y QRs.



Inteligencia Artificial: Google Gemini 2.5 Flash/Pro (vía Vercel AI SDK).



Estilos: CSS Modules (\*.module.css).



###### 2.2 Esquema de Base de Datos (Supabase)

El sistema depende de tres tablas críticas:



qr\_codes: Inventario de códigos físicos.



id (Text): Ej. "QR201". Primary Key.



category (Text): TENTACION, PASION, DESEO\_PROHIBIDO.



status (Text): 'NEW' (Sin usar), 'ACTIVE' (En uso), 'USED' (Finalizado), 'DISABLED'.



scan\_count (Int): Contador de escaneos.



session\_id (Text): Vincula el QR con la última sesión jugada (para ver resultados históricos).



game\_sessions: Estado vivo del juego multijugador.



id (Text): Ej. "GAME-XYZ".



qr\_id (Text): Referencia al QR.



status (Text): 'ACTIVE' (Jugando), 'REVEALED' (Cartas mostradas), 'CLOSED' (Finalizado).



p1\_state / p2\_state (JSON): Guarda nombre, deseo, score y carta seleccionada.



final\_deck (JSON): El mazo de 10 cartas generado por la IA.



desires\_history: Inteligencia de Negocios (BI).



title, type, intensity\_score, count, popular, status (CONFIRMED/REJECTED).



Se usa para entrenar al sistema y mostrar sugerencias curadas en el frontend.



##### 3\. Estructura de Archivos y Funcionalidad

A. Servicios (La Lógica del Negocio)

src/lib/supabaseClient.js: Cliente único de conexión a la base de datos.



src/services/iaService.js:



Centraliza la comunicación con la API de IA.



Maneja validateDesire, getSuggestions (prioriza DB, fallback a IA), getDesireScore y saveDesireStatus (para BI).



Contiene la lógica de generación del mazo final (generateFinalDeck).



src/services/qrAdminService.js: (Mantener para utilidades locales si es necesario, pero la fuente de verdad ahora es Supabase).



B. Rutas de API (Backend - Next.js Route Handlers)

Estos endpoints protegen la API Key de Gemini y ejecutan la lógica pesada en el servidor.



src/app/api/ia/validate-desire/route.js: Evalúa si un deseo cumple con la categoría.



src/app/api/ia/classify-desire/route.js: Asigna un puntaje (1-15) y categoría a un texto.



src/app/api/ia/generate-deck/route.js:



Core del Juego. Recibe los deseos y puntajes de P1 y P2.



Utiliza un System Prompt complejo para generar 8 cartas complementarias respetando reglas de intensidad (nunca superar el deseo del usuario) y roles cruzados (P1 hace para P2 y viceversa).



Usa zod para validar que la IA devuelva un JSON perfecto.



##### 4\. Flujo de Usuario (Step-by-Step)

###### 4.1 Modo Exploración (Público)

Home (src/app/page.js): Landing page.



Validación/Venta (src/app/explorar/validacion/page.js):



Simulador de deseos. El usuario escribe un deseo.



IA: classifyDesireForExploration determina qué chocolate (Categoría) necesita comprar para cumplir ese deseo.



Funcionalidad Extra: Si se escanea un QR aquí, muestra su estado/información.



###### 4.2 Modo Juego (Flujo del Ritual)

Entrada (src/app/invitacion-ritual/page.js):



P1 Escanea QR:



Verifica en DB si el QR es válido.



Si es NEW -> Pasa a ACTIVE. Crea sesión en game\_sessions.



Si es USED -> Busca la sesión cerrada y redirige a /cierre (Resultados).



Si es válido, muestra enlace para compartir con P2.



P2 Entra por Link: Se une a la sesión existente.



Sincronización: Realtime detecta cuando ambos están listos.



Elección de Deseo (src/app/eleccion-deseo/page.js):



Cada jugador escribe su deseo.



IA: validateDesire aprueba, rechaza o sugiere subir de categoría.



Sugerencias: Muestra deseos "Populares" curados desde la DB (desires\_history).



Al confirmar, se guarda el deseo y su score en la sesión.



Juego de Cartas (src/app/juego-cartas/page.js):



Generación: P1 detecta que ambos deseos están listos y llama a la API (generate-deck). La IA crea 8 cartas + 2 deseos de usuarios = 10 cartas. Se guarda en DB.



Sincronización: Ambos ven el mismo mazo. Si P1 toca una carta, se bloquea instantáneamente en la pantalla de P2 (via Supabase Realtime).



Revelación: Cuando ambos eligen, las cartas se dan vuelta.



Cierre (src/app/cierre/page.js):



Muestra el resultado final (las 2 cartas ganadoras).



Bloqueo: Marca la sesión como REVEALED (o CLOSED) y el QR como USED. Incrementa el contador de escaneos.



Guarda el historial para que el QR sea un "recuerdo" permanente.



##### 5\. Paneles de Administración (Uso Interno)

###### 5.1 Panel de QRs (src/app/admin/qr-panel/page.js)

Generador masivo de códigos (secuenciales por categoría).



Inserción directa a tabla qr\_codes.



Descarga de ZIP con las imágenes de los QRs para imprenta.



Monitorización de uso (columna scan\_count).



###### 5.2 Panel de Inteligencia de Deseos (src/app/admin/deseos/page.js)

Visualiza todos los deseos ingresados por los usuarios.



Permite filtrar por "Confirmados" vs "Rechazados".



Curación: El admin puede marcar deseos como "Populares" (icono corona). Estos deseos aparecerán automáticamente como sugerencias en la App para nuevos usuarios.



Exportación a CSV para análisis de marketing.



##### 6\. Decisiones de Diseño Importantes

Validación Estricta de IA: Se aumentó el límite de caracteres en el esquema JSON de la IA y se cambió al modelo gemini-2.5-flash para evitar timeouts en Vercel (Edge Functions).



Fallback de IA: Si la IA falla, el sistema no se rompe; existen sugerencias DEFAULT hardcodeadas y lógica defensiva.



Prevención de Fraude: Un QR USED redirige forzosamente al resultado histórico, impidiendo jugar dos veces con el mismo código.



Estética Inmersiva: Uso de fondo negro, tipografías con serifa (Times New Roman), y colores semánticos (Rojo, Plata, Oro) para mantener la atmósfera de "Ritual".

