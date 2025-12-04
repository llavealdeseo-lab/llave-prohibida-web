# Llave Prohibida - Experiencia Digital de Chocolate Interactivo.





### PARTE 1: Información General y Contexto



Versión del Documento: 1.0 (MVP Digital)

Fecha de Creación: \[22/11/2025]





### 1\. Presentación Estratégica del Proyecto

##### 1.1. Visión General y Concepto del Producto

"Llave Prohibida" se posiciona en el mercado como un innovador producto phygital (físico-digital), diseñado para fusionar el consumo de un bien físico premium —chocolate— con una experiencia digital exclusiva y gamificada. Esta estrategia de doble canal busca crear una marca experiencial única que ofrezca a las parejas una narrativa íntima, lúdica y memorable. El principal desafío técnico y estratégico de este enfoque reside en garantizar un vínculo fluido y seguro entre el producto físico tangible y el ritual digital exclusivo, validando primero la experiencia para asegurar la viabilidad del concepto antes de la producción a gran escala.

Pilares del Proyecto



• Visión Central: Crear una marca que combine un producto físico con un ritual digital exclusivo, activado por un código QR, para generar una experiencia narrativa personalizada mediante un mini-juego de cartas y el uso de Inteligencia Artificial (IA).



• Validación de Concepto (MVP): El objetivo inmediato es validar la experiencia digital de principio a fin, migrando de una simulación de datos a una arquitectura escalable y segura que garantice la integridad del sistema.



• Experiencia de Usuario: Generar deseo, juego y conexión entre las parejas a través de una narrativa sensual, elegante y provocadora, pero nunca explícita.

Roles y Responsabilidades



• Director del Proyecto: Responsable de la visión del producto, los requisitos de negocio y la experiencia de usuario final.



• Equipo de Desarrollo (Agente): Asume los roles de Arquitecto Técnico, Desarrollador Full-Stack, Diseñador UX/UI y Asistente de Documentación para ejecutar la visión del proyecto.

Esta visión estratégica se materializa a través de una gama de productos físicos cuidadosamente diseñados, cada uno vinculado a una intensidad de experiencia digital específica.



##### 1.2. Análisis de los Productos Físicos y Categorías de Intensidad

La estrategia de producto físico se basa en una segmentación por categorías de intensidad, diseñadas para corresponder a diferentes etapas de una relación y niveles de intimidad. Cada categoría de chocolate no solo define los límites del juego digital, sino que también establece las expectativas a través de un packaging y un precio diferenciados. Específicamente, estas categorías se mapean directamente a enumeraciones en la base de datos (chocolate\_type) y definen los rangos permitidos para la validación de intensidad\_puntaje por parte de la IA.

###### \*Producto: Chocolate **Tentación**

-Descripción de la Intensidad:Baja. Pensado para la etapa de conquista, con deseos suaves, románticos y de baja carga emocional/física.

-Detalles del Packaging:Caja negra con detalles rojos.

-Precio:USD 19.00



###### \*Producto:Chocolate Pasión

-Descripción de la Intensidad: Media. Para parejas con intimidad que buscan romper la monotonía con deseos eróticos y juegos de confianza.

-Detalles del Packaging:Caja negra con detalles plateados.

-Precio:USD 24.50



###### \*Producto:Chocolate Deseo Prohibido

-Descripción de la Intensidad: Alta. Para experiencias extremas que exploran tabúes, compromisos vitales o regalos de alto valor.

-Detalles del Packaging:Caja negra con detalles dorados.

-Precio: USD 49.90



###### \*Producto:Chocolate Sorpresa

-Descripción de la Intensidad:Aleatoria. No es una categoría en sí misma, sino una edición especial que genera expectación.

-Detalles del Packaging:Caja dorada con detalles negros.

-Precio:USD 28.90





La categoría "Sorpresa" es única en su concepción: el packaging no revela la intensidad del juego. En su interior, el usuario encontrará una tarjeta con un código QR que puede pertenecer aleatoriamente a cualquiera de las otras tres categorías (Tentación, Pasión o Deseo Prohibido), añadiendo un elemento de azar y emoción a la experiencia.

La compra de una categoría específica de chocolate es, por tanto, el primer paso que define las reglas y los límites de la interacción digital que se desbloqueará.









**B. ROLES Y CONTACTOS**

Director del Proyecto (Cliente): \[Su Nombre o Alias] Responsabilidad: Visión del Producto, Requisitos de Negocio, Experiencia de Usuario Final. Equipo de Desarrollo (Agente): Equipo Completo de Desarrollo Web (IA) Roles Desempeñados: Arquitecto Técnico, Desarrollador Full-Stack, Diseñador UX/UI, Asistente de Documentación.



**C. VISIÓN GENERAL DEL PRODUCTO**

Visión Final: Un producto físico (chocolate) con un ritual digital exclusivo, validado por un QR, que genera una experiencia narrativa personalizada mediante un mini-juego de cartas y el uso de Inteligencia Artificial (IA). Objetivo Inmediato (MVP - Producto Mínimo Viable): Validar la experiencia digital de punta a punta antes de la producción del chocolate físico. Alcance del MVP: Construir una landing page funcional que pase de la simulación de datos (archivos JSON) a una arquitectura escalable, integrando el mini-juego de cartas, la lógica de la IA y el sistema de validación de QR con integridad de datos (Base de Datos).





# Diseño y funcionamiento de pantallas para la web

Habrá dos modos en la web: una  modo exploración (publica, sin QR) y otra modo juego (privada, solo con QR valido).

Elementos y características generales para cada pantalla, tanto modo exploración, como modo juego:

•	Esquema de Color: Se implementó un esquema de color dinámico para los títulos, marcos de imagen y botones en la ficha individual, usando CSS inline y variables:

o	Tentación: Rojo (#A52A2A)

o	Pasión: Plateado (#CCCCCC)

o	Deseo Prohibido: Dorado (#FFD700)

o	Sorpresa: Negro (#333333)

•	Funcionalidad: todos los botones y los CTA tendrán una animación de pulso.

•	Funcionalidad: cada vez que en alguna pagina se habilite un botón la pagina se deberá mover y mostrar el botón.

•	Leyendas: todas las leyendas se centralizaran en el archivo del archivo llave-prohibida/src/data/leyendas.json





## 1\. Modo Exploración (pública, sin QR)

Para usuarios sin chocolate, con opción de simular deseos.

Este modo es cuando el usuario no tiene chocolate, pero llega a la pagina web, aquí podrá ver las cuatro presentaciones de chocolate con sus características y además podrá elegir entre alguna de ellas, también podrá probar deseo y ver en que categoría entra, para saber que chocolate debe comprar que incluya su deseo. Acá se lo incitara  a que compre alguno de las versiones del chocolate.

Objetivo: atraer usuarios sin chocolate, mostrar productos y simular deseos.



#### 1.1. Diseño de pantalla Home elementos:

• . llave-prohibida/src/app/page.js

• Video de fondo (hero\_desktop / hero\_mobile).

• Logo Llave Prohibida (centrado).

• Leyenda principal:

El chocolate es la llave que desbloquea el ritual del deseo. Una experiencia intima, lúdica y memorable con tu pareja, que despierta curiosidad, provoca fantasías y abre puertas a deseos que no sabías que tu pareja tenía. ¿Te animas a descubrirlo?”

• 	Botón CTA: “Explora chocolates” (botón con animación de parpadeo). →  El botón redirige a la pantalla de validación( llave-prohibida/src/app/explorar/validación) en donde se podrán probar deseos y ver con que chocolate tendrá la oportunidad de cumplirlo

• 	Leyenda secundaria (debajo del botón):

 “Si ya tienes tu chocolate solo tienes que escanear el código QR que aparece en la tarjeta, y el ritual del deseo comenzará.”



• 	Pestaña superior “Productos” → link a /productos . llave-prohibida/src/app/productos/\[categoria] : botón de productos arriba a la derecha que al posarse en el se despliega un menu con los cuatro chocolates en donde se pueden seleccionar, y si se hace clic en ellos se puede redireccionar a la pagina de los productos correspondientes

👉 Esta es la home por defecto de la web



• Interacción:

• 	Al escribir un deseo → la IA lo clasifica .

• 	Se resalta el chocolate correspondiente que cumple el deseo + “Sorpresa” (ya que en el chocolate puede tocar una tarjeta de cualquiera de las tres categoría)

• 	Click en un chocolate → redirige a /productos .





#### 1.2 Diseño de la pantalla de Exploración/validation

( llave-prohibida/src/app/explorar/validación)

Objetivo: Simulador de deseos y presentar chocolates

Estructura:

• imagen de fondo (hero\_desktop / hero\_mobile): Se añadió la imagen backgrounds/export/hero.png como fondo fijo con una capa oscura.

• Leyenda principal:

*En llave prohibida no solo compras un chocolate. Esto va mas allá, compras una llave que te permitirá escribir un deseo que tu pareja deberá cumplir. Un deseo que se esconderá detrás de una de diez cartas, solo dos cartas ganaran y quizás, si seleccionas bien, tu deseo este en una de ellas. Pero ese deseo tiene sus riesgos. Tu pareja también podrá escribir el suyo y si decides jugar TE COMPROMETES A CUMPLIR. Lo bueno es que aquí los limites solo lo pone la llave que compraste, puedes pedir cosas sexuales, claro, pero no solo eso, también puedes pedir regalos, viajes, tecnologías (cada categoría tiene un límite de precios) y hasta puedes retar a tu pareja, a muchas cosas: a que te muestre alguna aplicación, a que escriba algo en sus estados, a hacerlo en un lugar prohibido. No lo sé, el límite está en tu imaginación y en la llave que elijas.*

*Aquí puedes probar deseos que quieres que tu pareja te cumpla, yo te diré qué chocolate contiene la llave, que quizás con suerte, te pueda ayudar a cumplirlo."*



  • Campo de texto central: cuadro en donde podrá escribir deseos

 • Botón: “QUE CHOCOLATE PERMITE PEDIR EL DESEO”

• zona inferior”

Grid con los 4 chocolates (Tentación, Pasión, Deseo Prohibido, Sorpresa).

Cada uno con animación de entrada (fade-in + scale).

Cundo se posan sobre alguno de ellos se desplega una descripción

Cuando se clasifica un deseo:

•	Comportamiento de Resaltado:

 	"Sorpresa" siempre permanece en color completo (nunca se atenúa), independientemente de la clasificación del deseo.

o	El producto clasificado se resalta con un brillo pulsante usando su color de marca para el efecto.

o	Se implementó una descripción dinámica que aparece en la parte inferior al hacer hover o clasificar un deseo (usando validatorDescription y validatorInspiration del JSON).

o	Reinicio de Estado: Si el usuario borra el texto del cuadro, el resaltado se reinicia y los chocolates vuelven a su estado original.



Interacción

•	Al hacer click en un chocolate → redirige a src/app/productos/\[categoria]  donde se muestra la ficha individual (mockup, descripción, precio)



#### 1.3 Diseño de la pantalla de PRODUCTOS (src/app/productos/\[categoria])

Objetivo: Ficha individual de cada chocolate (mockup, descripción, precio).

Creando el Componente del Menú Desplegable para darle funcionalidad a la pestaña de "Productos"

•	src/components/Products/ProductsTab.jsx

•	src/components/Products/ProductsTab.module.css

home/Product/ficha individual de productos

 Plantilla de página que mostrará la información detallada de cada chocolate (Tentación, Pasión, Deseo, Sorpresa).

El objetivo es que al hacer clic en un chocolate del menú, el usuario sea redirigido a una URL como /productos/tentacion o /productos/sorpresa, y que la página cargue los datos correctos para ese producto. Esto se logra con el enrutamiento dinámico de Next.js.

•	src/app/productos/\[categoria]/page.js

•	src/app/productos/\[categoria]/ProductPage.module.css



Desarrollo:

src/app/productos/\[categoria]/page.js)

src/app/productos/\[categoria]/ProductPage.module.css)



	imagen de fondo: public/backgrounds/export/hero.png como fondo fijo con una capa oscura.

	titulo: “nombre de la categoría”

	imagen de la categoría: llave-prohibida/public/mockups/export/desktop/mockup\_”categoría”\_montaje.jpg

	descripción de la categoría: escribir la descripción para cada categoría.

	botón CTA “COMPRAR AHORA”



## 

## 2\.  Modo Juego (privada, solo con QR válido)

Objetivo general: el objetivo de modo juego es brindar una experiencia extra a la compra del chocolate, introduciendo un juego de cartas para parejas, que diferenciara a esta marca de chocolate del resto.

Experiencia completa activada por QR con el flujo:

cuando el usuario tiene el chocolate y escanea el código QR accede al ritual completo. En este caso entrara directamente a modo juego.

 	Flujo ritual: 1 escaneo de código principal →2 generacion de QR para sesión conjunta →3 test → 4 elecccion y validación deseo → 5 juego de carta → 6 revelación de resultado → 7 cierre emocional y bloque de QR.



#### 2.1. Diseño de pantalla home de modo juego: llave-prohibida/src/app/invitacion-ritual/page.js



Objetivo de la pagina:

dar la bienvenida, explicar las reglas del juego, recibir al jugador p1, generar QR de sesión conjunta, e indicar al p1 que comparta el enlace para que p2 se una a la sesión desde otro dispositivo. Y que p2 se una a la sesión.

flujo del usuario:

Escaneo del código principal : el jugador  P1 escanea el código QR que aparece en la tarjeta dentro del chocolate. entra a la pagina web se le da la bienvenida, se les explica un poco de que va el juego, aquí también aparecerán el código QR 2. Generación de QR para sesión conjunta: este código es un código para sesión conjunta, en donde p2 podrá acceder al juego desde otro dispositivo pero en la misma sesión. Cabe destacar que la experiencia esta pensada para realizarse mayormente desde dispositivos Mobile.

Descripción de pantalla para p1:

Elementos:

src/app/invitacion-ritual/page.js

src/app/invitacion-ritual/ InvitationPage.module.css

•	Video hero

•	Leyenda



Bienvenido/a a LLAVE PROHIBIDA este es un espacio, seguro para expresar tus deseos mas ocultos.

No solo compraste un chocolate, compraste una llave que te permitirá escribir un deseo que tu pareja deberá cumplir. Un deseo que se esconderá detrás de una de diez cartas, solo dos cartas ganaran y quizás, si seleccionas bien, tu deseo este en una de ellas. Pero ese deseo tiene sus riesgos. Tu pareja también podrá escribir el suyo y si decides jugar TE COMPROMETES A CUMPLIR. Lo bueno es que aquí los limites solo lo pone la llave que compraste, puedes pedir cosas sexuales claro, pero no solo eso, también puedes pedir regalos, viajes, tecnologías(cada categoría tiene un limite de precios) y hasta puedes retar a tu pareja, a muchas cosas: a que te muestre alguna aplicación, a que escriba algo en sus estados, a hacerlo en un lugar prohibido. No lo sé, el límite está en tu imaginación y en la llave que compraste:



TENTACION: Es la llave más tranquila, esta pensada para personas que recién se están conociendo. Los deseos que puedes pedir aquí están muy limitados.

PASION: En esta llave ya puedes dejar volar un poco tu imaginación. Esta pensada para parejas que quieren romper con la monotonía.



DESEO PROHIBIDO: Esta es una llave peligrosa, aquí puedes pedir lo que quieras. Solo diré eso, no quiero darte ideas



Tu llave es “CATEGIRIA”

Esta llave te permite (descripción de lo que puede hacer con las categoría escaneada y los deseos)

Pídele a tu pareja que escanee el código de sesión conjunta para continuar."

•	Código QR de sesión conjunta

•	Leyenda 2:

Si das en comenzar ritual, TE COMPROMETES A CUMPLIR.



•	Botón CTA “COMENZAR RITUAL”: este botón se habilitara cunado p2 allá escaneado el QR de sesión conjunta. Es decir que se le va a habilitara COMENZAR RITUAL a p1 cuando p2 este en línea.



Descripción de pantalla para p2:

desde que p2 escanea el código, la experiencia de modo jugo se divide en dos una para p1 y otra para p2

Elementos:

src/app/invitacion-ritual/page.js

src/app/invitacion-ritual/ InvitationPage.module.css

•	Video hero

•	Leyenda 1:



Bienvenido/a a LLAVE PROHIBIDA este es un espacio, seguro para expresar tus deseos mas ocultos.

No solo compraste un chocolate, compraste una llave que te permitirá escribir un deseo que tu pareja deberá cumplir. Un deseo que se esconderá detrás de una de diez cartas, solo dos cartas ganaran y quizás, si seleccionas bien, tu deseo este en una de ellas. Pero ese deseo tiene sus riesgos. Tu pareja también podrá escribir el suyo y si decides jugar TE COMPROMETES A CUMPLIR. Lo bueno es que aquí los limites solo lo pone la llave que compraste, puedes pedir cosas sexuales claro, pero no solo eso, también puedes pedir regalos, viajes, tecnologías(cada categoría tiene un limite de precios) y hasta puedes retar a tu pareja, a muchas cosas: a que te muestre alguna aplicación, a que escriba algo en sus estados, a hacerlo en un lugar prohibido. No lo sé, el límite está en tu imaginación y en la llave que compraste:



TENTACION: Es la llave más tranquila, esta pensada para personas que recién se están conociendo. Los deseos que puedes pedir aquí están muy limitados.

PASION: En esta llave ya puedes dejar volar un poco tu imaginación. Esta pensada para parejas que quieren romper con la monotonía.



DESEO PROHIBIDO: Esta es una llave peligrosa, aquí puedes pedir lo que quieras. Solo diré eso, no quiero darte ideas



Tu llave es “CATEGORIA”

Esta llave te permite (descripción de lo que puede hacer con las CATEGORIA escaneada y los deseos)

•	Leyenda 2:

Si das en comenzar ritual, TE COMPROMETES A CUMPLIR.



•	Botón CTA “COMENZAR RITUAL”: este botón estará activo desde el primer momento



##### 2.1.1. Como interactúan tanto el código QR y la IA con las paginas

src/app/invitacion-ritual/page.js: cunado el p1 escanea el código QR que aparece en la tarjeta del chocolate, el sistema interpretara que alguien quiere entrar al modo juego. Si el QR presenta el estado de USADO, el sistema automáticamente lo enviara a la página de cierre y le mostrara el cierre que tubo esa sesión. Si el QR nunca se escaneo el sistema va a tomar que es un QR SIN USAR y comenzara el MODO JUEGO, inmediatamente creara una QR de sesión conjunta y la sesión de dividirá en dos: una para el p1(el que escaneo el código de la tarjeta) y otra para el p2 (el que escaneo el código de sesión conjunta) Además tomara del QR la categoría a la que pertenece (tentación, pasión, deseo prohibido) para generar un flujo en todas las paginas personalizado a la categoría.

La idea es que cuando le aparece la página de bienvenida a P1 con todo lo que ya definimos, también pueda hacer la experiencia p2. como lo vamos a hacer: donde tiene que estar el código QR de sesión conjunta habrá un enlace que me abra una ventana nueva con el fujo de sesión de p2, de esa manera vamos comprobando que todo funcione tanto para P1 como para P2. cuando a p2 se le abre la ventana, a p1 se le habilita el botón de comenzar ritual.





#### 2.2. Test de Personalidad

El test tendrá una estructura simple de 6 preguntas con botones de opción (A, B, C) y un botón que simula el avance y el desbloqueo del feedback del otro jugador. El punto clave es que el Test es opcional y sirve para personalizar el mazo de cartas y mejorar las sugerencias de deseos. Esto le da al usuario control y baja la barrera de entrada al juego.

Test: ahora, cada uno de los jugadores estará desde dispositivos diferentes, pero en la misma sesión y a cada uno de ellos, se le hará un test. la IA es quien ara este test, no muy largo, para identificar el perfil de la persona y poder colocar deseos(los 8 deseo que elige la IA para el juego, cuatro de esos deseo serán enfocados en el perfil de la P1 y los otros 4 enfocados en el perfil de la P1, pero los 8 deseos no superaran la categoría del chocolate que compraron) acorde a cada una de las personas y acorde a la categoría del chocolate. Este test también servirá para poder sugerirle deseo en caso de estar en duda. Dentro de las preguntas estará: el tipo de relación que tienen, cuanta confianza hay entre ellos, si están dispuesto a entregar algo valioso por que su deseo se cumpla. El test no va a ser obligatorio solo lo vamos a utilizar para colocar cartas dentro del maso que se adapten a cada perfil y para sugerirle deseo que adapten a su categoría y su perfil. Antes de comenzar el test, se les comunicara porque estamos haciendo el test y se les dirá que si no quieren hacerlo el sistema colocara deseo aleatorios de la categoría sin tener en cuenta sus preferencias.



•  Leyenda Inicial: Añadir una explicación clara sobre la opcionalidad del test y sus beneficios (personalización) o consecuencias (deseos aleatorios).

•  Opcionalidad / CTA: Incluir un botón de "Saltar Test" que lleve directamente a la siguiente fase (/eleccion-deseo).

•  Lógica de Desbloqueo: El botón "Elegir Deseo" debe activarse si: a) el test está completado, o b) el usuario elige saltar el test.



•	src/app/test/page.js

•	src/app/test/ TestPage.module.css



##### 2.2.1. Como interactúan tanto el código QR y la IA con las paginas

src/app/test/page.js: en esta página el sistema tomara de la página anterior src/app/invitacion-ritual/page.js , numero de la sesión QR, quien es el participante(participante n1, el que escaneo el código de la tarjeta, o el participante n2 en que escaneo el código de sesión conjunta) y la categoría(para personalizar la página, para mostrar leyendas específicas de la categoría, EJ: si la categoría es tentación, y el perfil de participante da mas para una categoría mas avanzada “pasión” el sistema le indicara que “su perfil concuerda mas con una categoría un poco mas atrevida, en futuras compras considere compra un chocolate un poco mas atrevido, PASION seria una buena opción” ). El sistema deberá dar un puntaje según las respuestas del test, que indique el perfil del participante, para comunicárselo a la página siguiente.





##### 2.3. Elección y Validación del Deseo (src/app/eleccion-deseo/page.js)

El objetivo de esta página es que cada jugador ingrese su deseo y reciba feedback si su deseo excede la intensidad del chocolate (ej: comprar Tentación y pedir un deseo de Deseo Prohibido)

Descripción: elección y validación de deseo: ambos podrán probar y elegir su deseo. En la pantalla aparecerá el cuadro para que escriban el deseo y un botón que diga "validad"(ese botón es para probar los deseo, es decir, ver si el deseo que están escribiendo corresponde a su categoría) en el momento que den con un deseo que la IA lo valide aparecerá una leyenda "este deseo pertenece a tu categoría, si estás seguro/a:" aquí aparecerá otro botón que dice "confirmar deseo ". recuerda que en esta pantalla la IA podrá sugerir deseo que se adapten a la categoría de la llave y al perfil de la persona por lo que tiene que haber un cuadro de dialogo. Una vez que cliquean en confirmar deseo se los redirigirá a la pantalla de juego de cartas, en donde aparecerán las diez cartas y podrán elegir una cada uno.

   Elementos:

•	src/app/eleccion-deseo/page.js

•	src/app/eleccion-deseo/ EleccionDeseoPage.module.css



• 	leyenda:.

“Aquí puedes probar deseos que quieres que tu pareja te cumpla, yo te diré si entra en la categoría de tu llave"



• 	Campo de texto”escribe tu deseo”

• 	 botón CTA “VALIDAR”.

• 	Cuadro de diálogo con ejemplos de la categoría/ sugerencias de la IA.





• 	Si el deseo excede categoría → feedback + sugerencias IA.

• 	Si es válido → aparece leyenda:

“Este deseo pertenece a tu categoría, si estás seguro/a:”

• botón “CONFIRMAR DESEO”.



###### 2.3.1. Como interactúan tanto el código QR y la IA con las paginas



src/app/eleccion-deseo/page.js: esta página tomara de la página anterior el número de sesión QR, el número del participante (p1, el que escaneo el código de la tarjeta, o el p2 el que escaneo el código de sesión conjunta), el puntaje del test, la categoría de la llave. Con estos datos de la página anterior el sistema transformara la estética y las leyendas según la categoría. Además, la IA le mostrara ejemplos de deseos que se adapten a su perfil, pero que no superen a la categoría de la llave. En el momento que el participante escribe un deseo y valida, la IA analiza si pertenece a la categoría de la llave, si el deseo supera la categoría la IA responderá “su deseo no pertenece a esta categoría, pertenece a la categoría ………. Por favor escriba otro deseo”. En caso de que el deseo pertenezca a la categoría, la IA dará como aprobado el deseo y habilitara el botón de comenzar juego de cartas. Luego guardará el deseo para pasárselo a la próxima página.  En caso de que el deseo que solicito el participante, no esté en la base de datos, la IA lo agregara a la base de datos indicando el título, la descripción y la categoría a la que pertenece.



#### 2.4. Juego de cartas src/app/juego-cartas/page.js



Juego de carta descripción: cada uno de los usuarios ya eligió y la IA valido el deseo, esos deseos se transformaron en dos carta del maso de 10. A cada uno de los participante le aparecen 10 cartas en pantalla, y deberán elegir una carta que se resaltara en la pantalla del otro participante para que no pueda elegirla, cuando ambos eligieron su carta y ambas cartas estén resaltadas, se muestran las 10 cartas con las dos ganadoras resaltadas y animadas

Lo hay que tener en cuenta es que de los 8 deseos que va a colocar la IA en el maso de cartas, 4 van a ser elegidos según el perfil del p1 y los otros 4 según el perfil del p2(pareja) es decir que dentro del maso van a haber 5 cartas focalizadas en p1(1 carta elegida por él y 4 por la IA) y las otras 5 en p2(1 carta elegida por el y 4 por la IA)

Vamos a implementar la simulación del Juego de Cartas (/juego-cartas), respetando las siguientes características:

1\.	Mazo de 10 Cartas: 2 Deseos de los Jugadores  y 8 Deseos de la IA (personalizados).

2\.	Personalización: 4 cartas de la IA focalizadas en el Jugador 1 y 4 en el Jugador 2 .

3\.	Selección Mutua y Bloqueo: Un jugador elige una carta, esta se resalta y se bloquea para que el otro jugador no pueda elegirla.

4\.	Desbloqueo Final: El juego solo avanza cuando ambos han elegido y confirmado su carta.



Elementos:

src/app/juego-cartas/page.js

•	Leyenda: “¿Te sientes con suerte? Elige una carta, hay una que esconde tu deseo. El resto tiene cosas para hacer en pareja que el sistema eligió”

•	Diez cartas tienen que esta boca abajo.





Revelación de resultado: una vez que los dos eligieron su carta, el maso completo se revelara con las dos cartas seleccionadas resaltada y con una animación de latido.

¿Porque se muestran todas las cartas? para que los participantes puedan ver que había elegido la IA y para ver en donde estaban sus deseos en caso de no haberlo sacado.

luego de que pasaron 5 segundo mostrando el resultado del juego automáticamente se pasara a la pagina de cierre(src/app/cierre/page.js).



###### 2.4.1. Como interactúan tanto el código QR y la IA con las paginas



src/app/juego-cartas/page.js: el sistema le pedirá a la página anterior (src/app/eleccion-deseo/page.js) el numero de la sesión QR, el deseo de los participantes para transformarlo en dos de las cartas del maso, y la categoría para revisar en la base de datos del deseo de esa categoría y tomar/generará 4 deseo que se adapten al perfil y la categoría de p1 y 4 deseo que se adapten al perfil y categoría de p2. Con esos datos armara el maso de 10 cartas de la sesión. Una vez que los participantes eligieron sus cartas el sistema guardara los datos de la sesión para mostrárselos a la siguiente página.







##### 2.5. Cierre Emocional y bloqueo de QR (src/app/cierre/page.js)



Esta es la última página del flujo del Modo Juego. Simplemente mostrará las diez cartas con las dos cartas elegidas y un mensaje de cierre y agradecimiento.

Desarrollo:

src/app/cierre/page.js

src/app/cierre/ CierrePage.module.css



•	Leyenda:

“El ritual ha terminado, recuerden que se comprometieron a cumplir. Aquí están sus dos tareas”

•	Resultado del juego:

se mostrarán las 10 cartas con las dos cartas seleccionadas.

•	Leyenda:

“Su sesión a terminado el código QR se bloqueará y no podrán usarlo para jugar de nuevo, aunque si le quedara de recuerdo, si lo escanean les mostrara esta pantalla.”

Si quieren una revancha, o la lleve que compraron no incluían tu verdadero deseo, puedes explorar que chocolate lo incluye.

•	Botón: “EXPLORAR CHOCOLATE” este botón redireccionara a la pagina llave-prohibida/src/app/page.js (modo exploración)



###### 2.5.1. Como interactúan tanto el código QR y la IA con las paginas



llave-prohibida/src/app/cierre/page.js el sistema le pedirá la pagina anterior src/app/juego-cartas/page.js el maso de 10 cartas que utilizo y las dos cartas ganadoras para mostrárselas a los participantes. En esta instancia el QR de la sesión se bloqueará y se almacenara en una base de datos de QR usados, con los datos de esta ultima pagina, para que cuando se escanee un código QR usado se muestren los datos correspondientes(las 10 cartas con las 2 seleccionadas).







#### 3\. COMPONENTES CLAVE DEL PROYECTO

##### 3.1. Estética Visual

•	Paleta: Negro profundo, dorado antiguo, vino oscuro

•	Tipografía: Serif dorada con acentos en cobre

•	Elementos visuales: Chocolate envuelto en dorado, llave dorada antigua, sombras curvas sugerentes

•	Estilo: Sensual, elegante, provocador, pero no explícito

##### 3.2. Productos Físicos

El packaging de los chocolates tienen todo el mismo tamaño (20cmx8cmx2.5cm) también la misma composición. Pero no tienen los mismo detalles ni el mismo precio:

•	Chocolate Tentación (usd19): Caja negra con detalles rojos - Intensidad baja

•	Chocolate Pasión (usd24.5): Caja negra con detalles plateados - Intensidad media

•	Chocolate Sorpresa (usd28.9): Caja dorada con detalles negros - Intensidad aleatoria

•	Chocolate Deseo Prohibido (usd49.9): Caja negra con detalles dorados - Intensidad alta

##### 3.3. Caracteristicas técnicas de Eleccion de deseo

      LÓGICA DE DECISIÓN IA

###### 3.3.1. Mini diagrama de decisión

•	Usuario escribe un deseo

•	¿El deseo pertenece a la categoría del chocolate comprado?

•	NO. IA pregunta ¿el deseo pertenece a una categoria mas baja?

&nbsp;                         SI:IA acepta el deseo:
                                               -sugiere que pida un deseo un poco mas osado(no desperdicies tu llave)



&nbsp;                         NO:IA rechaza el deseo:

                                      - "Tu deseo es más osado que tu llave actual."

                                       - Sugiere ejemplos de la categoría correcta.

                                       - Recomienda probar otra categoría en el futuro



•	SI. IA Aceptar deseo:

•	Guardar deseo en base de datos temporal

•	Clasificar en 4 dimensiones:

 - Intensidad (Tentación, Pasión, Deseo Prohibido)

 - Valor monetario

 - Carga emocional

 - Carga física

•	Añadir al mazo de 10 cartas

•	Registrar en histórico de deseos

•	¿El deseo se repite con frecuencia?:

o	NO: mantener en histórico normal(para IA futura)

o	SI: marcar como “popular” y mostrarlo como sugerencia



###### 3.3.2. Características y ejemplos sugerentes por categoría



Cuando el usuario entra a la pantalla de selección de deseo, debe aparecer un texto introductorio como:

***“En Llave Prohibida podés pedir lo que quieras… siempre dentro de la intensidad de tu chocolate. Inspirate con estos ejemplos y animate a escribir el tuyo.***”



###### Tentación (baja intensidad)

Definición: Deseos suaves, románticos, de conquista inicial. Baja carga física y emocional. Regalos pequeños (≤ USD 100). los deseos tentacion estaran clasificado a su ves por valor numerico del 1 al 5 indicando la intencidad de cada deseo, ejemplo un deseo 1 seria un deseo tentacion de muy baja intensidad, no presupone una complicacion cumplirlo. un deseo 5 seria un deseo muy dificil de cumplir(un regalo de 100usd) si el regalos tubiera un valor de 50usd seria una deseo de un valos entre 2 y 3

Ejemplos:

• 	Abrazarme fuerte antes de dormir

• 	Invitarme a una cita tranquila(3)

• 	Regalarme flores o chocolates(3)

• 	Mandarme un audio romántico

• 	Regalo: “Un perfume de hasta USD 100”(5)

• 	Emocional: “quieres ser mi novio/a”(5)

• 	Físico: “Un beso apasionado en la boca”



Notas para IA:

• Palabras clave: beso, abrazo, cita, regalo pequeño, detalle.

• Si el deseo excede este nivel (ej. viaje, sexo explícito), sugerir bajar la intensidad o recomendar chocolate Pasión.



Pasión (intensidad intermedia)

Definición: Deseos eróticos, juegos íntimos, retos de confianza. Regalos medianos (≤ USD 300). los deseos pasion estaran clasificado a su ves por valor numerico del 6 al 10 indicando la intencidad de cada deseo, ejemplo un deseo 6, seria un deseo pasion de muy baja intensidad(cena, sexo sin ninguna peticion rara), no presupone una complicacion cumplirlo. un deseo 10 seria un deseo muy dificil de cumplir(un estrptis, un regalo de 300usd,)si el regalos tubiera un valor de 150usd seria una deseo de un valos entre 7 y 8.

Ejemplos:

Regalo: “Una cena lujosa en un restaurante”

Emocional: “Déjame ver tus mensajes por un rato”

Físico: “Un baile erótico con lencería”

Probar una nueva posición sexual

Reto: Dejarme ver tus mensajes por un rato

Regalo: Una cena lujosa en un restaurante

Regalo:Un día en un spa juntos

Notas para IA:

Palabras clave: sexo, lencería, juego erótico, reto de confianza, cena, spa.

Si el deseo es demasiado extremo (ej. látigo, viaje caro), recomendar chocolate Deseo Prohibido.



Deseo Prohibido (intensidad alta)

Definición: Deseos extremos, tabúes sexuales, compromisos vitales o regalos de alto valor (≤ USD 3000).los deseos prohibidos estaran clasificado a su ves por valor numerico del 11 al 15 indicando la intencidad de cada deseo, ejemplo un deseo 11, seria un deseo pasion de muy baja intensidad(cena lujosa, baile herotico), no presupone una complicacion cumplirlo. un deseo 15 seria un deseo muy dificil de cumplir( un regalo de 3000usd,)si el regalos tubiera un valor de 1500usd seria una deseo de un valos entre 12 y 13.

Ejemplos:

• 	Físico: Quiero que me azotes con un látigo

• 	Físico: Tener sexo en un lugar público

• 	Regalo: Un viaje a Brasil

• 	Regalo: Un iPhone nuevo

• 	Emocional y físico: Tener un bebé

• 	Emocional: “Que me pidas casamiento”



Notas para IA:

• Palabras clave: látigo, público, viaje, iPhone, casamiento, bebé.

• Si el deseo es aún más grande (ej. “quiero una mansión”), marcar como fuera de rango y sugerir ajustar.

Sorpresa

Definición: no es una categoría en si. Es un empaque diferente, con la particularidad que la tarjeta que viene dentro es aleatoria (puede contener una de las tres categorías: Tentación, Pasión o Deseo Prohibido). La aleatoriedad se dará al momento del empaque del producto en el que se decidirá que tarjeta de las tres categorías se colocará.

Ejemplos:

• el usuario abre la caja de chocolate sorpresa y dentro de la caja de chocolate hay una tarjeta de la categoría pasión

Notas para IA:

• No habrá tarjetas especiales para sorpresa, el sistema solo identificará una de las tres categorías (tentación, pasión, deseo prohibido)





###### 3.3.3. Notas aclaratorias para IA (muy importante):

 “Este glosario funciona como base semántica para la IA. Cada deseo ingresado por los usuarios debe ser analizado en función de:



-Intensidad (categoría del chocolate)

-Valor monetario

-Carga emocional

-Carga física

Con esos datos la IA debe clasificarlos con un valos numerico dentro de cada categoria tentacio de 1 al 5. pasion del 6 al 10 y deseo prohibido del 11 al 15

Si el deseo excede la categoría del chocolate comprado, la IA debe sugerir un deseo alternativo dentro de la categoría y recomendar al usuario probar una categoría superior en su próxima compra.”

• Los ejemplos sugerentes deben mostrarse siempre por defecto en la pantalla de selección de deseo.

• Si el usuario escribe un deseo fuera de su categoría, la IA debe:

1\. Informar que el deseo pertenece a otra categoría.

2\. Sugerir ejemplos de la categoría correcta.

3\. Recomendar probar otra categoría de chocolate en el futuro.

• Todos los deseos escritos por usuarios deben guardarse en un histórico.

• Los deseos más repetidos deben marcarse como “populares” y ofrecerse como sugerencias automáticas en futuras sesiones.

 la IA no podrá colocar deseo en el maso que superen el puntaje del deseo elegido por cada participante. ejemplo si el p1 tiene un llave pasión(6 al 10) y pide un deseo con con un valor de 9 la IA solo podrá colocar en el maso de cartas, 4 deseos dentro de la categoría pero que sean menor al puntaje del deseo que pidió es, decir con puntaje de 6 al 8. luego hará lo mismo con las 4 cartas de p2 para completar el maso.









#### 3.4. Características Técnicas Sistema de QR

QRs únicos: Rutas dinámicas y parámetros

características del escaneo del QR:

los QR que están en las tarjetas dentro del chocolate va a ser de uso único, es decir que cuando termine la experiencia(cuando se hallan revelado los deseos) el QR se bloqueara y no podrán volver a jugar con ese QR. En caso de que lo vuelvan a escanear, el QR les mostrara el resultado de cartas que obtuvieron esa ves y le sugerirá que compren un nuevo chocolate si quieren volver a jugar.

cada QR tiene que indicar a que categoría pertenece (tentación, pasión, deseo prohibido).

dentro del juego van a haber dos QR diferentes, el QR que viene en el chocolate y un QR de sesion conjunta que va a tener que escanear la pareja.



•	Mini juegos: Componentes React con animaciones

•	Agentes de IA: APIs desde backend de Next.js

•	Hosting: Vercel (gratuito para plan básico)

	Generación masiva por categoría

• 	Vos (administrador) pedís al sistema que genere, por ejemplo, 1500 QR.

• 	Se dividen en 500 Tentación, 500 Pasión, 500 Deseo Prohibido.

• 	Cada QR se guarda en la base de datos con:

• 	ID único

• 	Categoría (tentación/pasión/deseo\_prohibido)

• 	Estado (disponible, usado, bloqueado)

• 	Fecha de creación

	Alta automática en la web

• En el momento de generarlos, quedan registrados en la base de datos y listos para usarse.

• Cada QR apunta a una URL única (ejemplo: https:/llaveprohibida.com/qr/abc123).

	Uso y Bloqueo post-uso

• 	Cuando un usuario escanea el QR, se crea una sesión de juego.

• 	Al terminar el ritual, el QR cambia de estado a bloqueado.

• 	Si alguien lo vuelve a escanear, ya no inicia un juego nuevo: muestra el resultado de esa sesión (mazo de 10 cartas con las 2 ganadoras resaltadas).

	QR de sesión conjunta:

•	Cuando el jugador 1 entra con su QR, el sistema genera un segundo QR temporal para que el jugador 2 se una desde otro dispositivo.

•	Este QR de sesión conjunta expira cuando termina el juego.

	Panel de administración (generar, listar, habilitar, exportar)

Va a ser una página oculta en la misma web, protegida con contraseña.

En ese panel vas a tener botones como:

• 	“Generar QR” → administrador elije la cantidad y categoría.

• 	“Ver listado de QR” → muestra tabla con ID, categoría, estado (disponible/usado/bloqueado).

• 	“Habilitar/deshabilitar QR” → activás o pausás QR según stock de chocolates.

• 	“Exportar QR” → descargás los QR en imágenes (PNG) para imprimir en las tarjetas.

 En el documento vamos a dejar asentado:

• 	Responsable: IA (desarrollo del generador).

• 	Acción del administrador: ingresar al panel, elegir cantidad y categoría, descargar los QR.

	Vista de re-escaneo (resultado fijo):

•	Si alguien lo vuelve a escanear, ya no inicia un juego nuevo: muestra el resultado de esa sesión (mazo de 10 cartas con las 2 ganadoras resaltadas) y sugiere nueva compra.



#### 3.5 Características técnicas del juego de cartas

Lógica del juego:

a cada uno de los participantes le aparecerá el mismo maso con 10 cartas boca abajo, cada uno de ellos deberá elegir una carta, en el momento que uno selecciono una carta, esa carta se bloqueara en el dispositivo del otro(para que no puedan elegir la misma carta). Una vez que ambos hayan seleccionado su carta, se mostrara todo el maso con las dos cartas seleccionada resaltadas y con una animación.

•	Composición del maso de 10:

el maso estará compuesto por diez cartas de las cuales,  dos de ellas serán elegidas por los participantes(esas dos cartas representaran los deseo que los participantes eligieron anteriormente). Las otras ocho cartas serán seleccionadas por la IA en función de la categoría de la llave y el test de personalidad de los participantes(si se realizo) y el deseo que pidió cada participante.

•	Notas y aclaraciones que tiene que tener en cuenta la IA:

o	Los deseos que coloque en las 8 cartas no pueden ser mas intensos que los que pidieron los participantes.

 Cuatro de los deseos estarán focalizados en el participantes 1 (la IA tendrá en cuenta: el perfil de ese participante, la categoría de la llave y los deseo será focalizado en que el participante 2 haga cosas para el participante 

1 ) y las otras cuatros estarán focalizado en el participante 2(la IA tendrá en cuenta: el perfil de ese participante, la categoría de la llave y los deseo serán focalizado en que el participante 1 haga cosas para el participante 

2). Si el participante no hace el test, la variable de perfil del participante se tomara con respecto a la intensidad del deseo que pidió ejemplo:

&nbsp;  a)categoría pasión(de 6 a 10), si el participante pidió un deseo de puntaje 8 la IA deberá colocar 4 deseo con puntaje entre 7 y 6.
   b)categoría Pasión(6 a 10) si el participante pidio un deseo de puntaje 5, es decir deseo perteneciente a la categoría tentación(deseo por debajo de la categoría de la llave comprada) la IA colocara 4 cartas con una intensidad de 5.
   c)categoría deseo prohibido de 11 a 15, si el participante pide un deseo de caracter monetario(un viaje a Brasil) la IA interpretara que el perfil de la persona esta focalizado/interesado en las cosas materiales, por lo que colocara en el maso de cartas de este participante por lo meno dos cartas que tengan que ver con regalos, pero que pertenezcan a una categoría menor en este ejemplo a una categoría Pasión(una cena en un restaurante lujos, un día de spa)

&nbsp;  d)deseo prohibido: si el contenido del deseo tiene un carter sexual muy marcado la IA interpretara que el objetivo de ese participante es tener experiencias sexuales fuertes, por lo que en las 4 cartas que corespondan a ese participante, colocara deseo con connotacion sexual pero de una categoría menor a la de la llave en este ejemplo a la categoría pasión.  





o	Cada deseo que las parejas pidan se sumaran a la base de datos para ser analizado y agregados al los mazo de cartas maestro.

el maso de carta maestro será un maso de cartas que armara la IA con los deseos de cada categoría por lo que la IA tendrá que tener tres mazos uno para cada categoría. Cada ves que la IA valla a crear un maso de 10 cartas para el juego, buscara las 8 cartas que más se adapten a los perfile dentro del maso maestro correspondiente.

Los mazos maestros no podrán superar las 500 cartas, es decir que como máximo habrán 3 mazos de 500 cartas cada uno

En el caso de los deseo/regalos que implican valor monetario, la IA solo podrá incluir deseos de este tipo que estén por debajo de la categoría, es decir. Si los participantes están en una categoría deseo prohibido y la IA solo podra colocar deseos monetarios de la categoría Pasión. Los deseos que coloque la IA siempre tiene que ser menos intensos que los que colocaron los participantes.













### PARTE 2: Reglas de Compromiso (La "Constitución" del Proyecto)



Esta es la sección que me permite actuar como un equipo profesional. No debe modificarse.



**D. REGLAS DE COMUNICACIÓN Y PROCESO**

1\. Fuente de la Verdad y Memoria: Este Documento Maestro es la única fuente de la verdad. En caso de duda sobre información o el estado último del proyecto, el Equipo de Desarrollo (IA) deberá solicitar el Documento Maestro actualizado.

2\. Sinceridad Crítica: El Equipo de Desarrollo será totalmente sincero y crítico en sus opiniones sobre el proyecto, con el fin de priorizar la estabilidad, escalabilidad y la visión a largo plazo.

3\. Explicaciones Claras: Todos los conceptos técnicos deben ser explicados en español claro, evitando jerga innecesaria y utilizando analogías simples.

4\. Enfoque Paso a Paso: Las tareas se dividirán en fases y pasos pequeños y accionables. Después de cada paso, el Equipo de Desarrollo preguntará: "¿Desea proceder o hacer ajustes?"

5\. Toma de Decisiones: Para cada paso crucial, se presentarán opciones claras, sus pros, sus contras, y una recomendación para el MVP. La decisión final corresponde al Director.



**E. GESTIÓN DE CÓDIGO Y ARCHIVOS**

1\. Protocolo de Cambios: Antes de realizar cualquier cambio, modificación o creación de un archivo, el Equipo de Desarrollo preguntará: "¿El archivo existe?"

2\. Archivo Existente: Si el archivo existe, el Director debe proporcionar la ubicación y el contenido completo del mismo. El Equipo de Desarrollo se encargará de realizar una reestructuración profesional del código:

     a) Preservar lo ya definido.

     b) Eliminar lo que ya no es funcional.

     c) Agregar/Modificar las nuevas funciones.

3\. Nuevos Archivos: Cada nuevo archivo creado debe especificar su función exacta y esta información debe ser agregada al Documento Maestro de inmediato.



### PARTE 3: Arquitectura y Tecnologías (Decisiones Críticas)

Esta sección define las herramientas que usará el equipo de desarrollo para construir el proyecto. La adopción de esta nueva arquitectura permite la escalabilidad y la seguridad del sistema de QR.







###### F. DEFINICIÓN DE LA ARQUITECTURA (STACK TECNOLÓGICO)



\*Backend / Base de Datos: Supabase.

&nbsp;  ✅ Supabase Project URL: RECIBIDA. https://sulinkgqqvnzxvdexrpf.supabase.co

&nbsp;  ✅ Supabase Anon Key URL: RECIBIDA.

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGlua2dxcXZuenh2ZGV4cnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDY3MjIsImV4cCI6MjA3OTQyMjcyMn0.Eak2B3UrdkuFgXWYhhGGPL6rBKqdT7DG5qM0GRR1KeQ

&nbsp; -Función: Guarda las sesiones, conecta a P1 con P2 en tiempo real  y persistencia de datos segura.

&nbsp; -Mejora de Robustez: Implementaremos "Row Level Security" (Seguridad a Nivel de Fila). Esto significa que, aunque un hacker intente entrar a la base de datos, solo podrá ver su propia partida, nunca la de otras parejas. Es un estándar de seguridad bancaria aplicado a nuestro juego.

&nbsp; -Cambio: Se elimina la dependencia de localStorage para la lógica del juego.



\*Inteligencia Artificial (IA): Google Gemini (vía Google AI Studio y Vercel AI SDK).

&nbsp;  ✅ Google AI Studio API Key: RECIBIDA. AIzaSyAOukGIUTFkRS47d8CYL79tV2fUhspQ2uE

-Función: Genera las cartas, analiza los deseos y modera el contenido.

-Mejora: Usaremos una técnica llamada "Structured Outputs" (Salidas Estructuradas). Esto obliga a la IA a responder siempre en formato de código perfecto, evitando que la web se rompa porque la IA "se puso creativa" con el formato.



\*Infraestructura: Next.js + Vercel..

&nbsp;   -Mejora: Activaremos Vercel Analytics. Nos dirá (sin invadir privacidad) qué botón pulsan más, dónde se quedan trabados y qué modelo de celular usan más. Información oro para ti como Director.







# 

# 

