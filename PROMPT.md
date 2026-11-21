Crea una página web llamada PlataClara para controlar los gastos mensuales personales. Usa solo HTML, CSS y JavaScript puro, sin frameworks ni librerías externas, en tres archivos: index.html, style.css y script.js.

PÚBLICO Y ALCANCE
Es para personas que quieren ordenar su plata y ver en qué se les va en el mes. No debe tener pagos reales, conexión con bancos ni inicio de sesión. Usa solo datos de ejemplo ficticios.

PANTALLAS (una sola página, que cambie de vista sin recargar)
1. Inicio: título PlataClara, una frase corta de bienvenida, una tarjeta grande con el total gastado en el mes actual, el número de gastos registrados y un botón destacado "Agregar gasto".
2. Agregar gasto: formulario con monto (en pesos colombianos), categoría (Comida, Transporte, Estudio, Ocio, Otros), fecha y una descripción corta. Botón "Guardar" y botón "Cancelar". Valida que el monto sea mayor que cero y que la fecha no esté vacía, mostrando un mensaje claro si falta algo.
3. Resumen: lista de gastos ordenada del más reciente al más antiguo, con opción de eliminar cada uno; total por categoría con una barra de progreso simple hecha con CSS (sin librerías); y el total del mes. Botón para volver al inicio.

FUNCIONAMIENTO
- Guarda los gastos en localStorage para que no se pierdan al recargar.
- Cuando no haya gastos, muestra un estado vacío amable con un mensaje y el botón para agregar el primero.
- Incluye 5 gastos de ejemplo ficticios que se carguen la primera vez.
- Formatea el dinero como pesos colombianos, por ejemplo $ 25.000.

DISEÑO
- Aspecto moderno, limpio y profesional, tipo app de finanzas.
- Paleta sobria: fondo gris muy claro, tarjetas blancas con bordes redondeados y sombra suave, color principal verde azulado (teal) para botones y acentos, texto gris oscuro.
- Tipografía sans-serif del sistema, con buena jerarquía (título grande, subtítulos medianos, texto legible).
- Cada categoría con su propio color de etiqueta.
- Botones con efecto al pasar el mouse y transiciones suaves.
- Responsive: debe verse bien en celular y en computador, con contenedor centrado de ancho máximo.
- Buen contraste y campos de formulario con etiquetas visibles.

CÓDIGO
- Código ordenado, con nombres claros y comentarios breves en español.
- Sin dependencias ni instalación: debe abrir con solo doble clic en index.html.
