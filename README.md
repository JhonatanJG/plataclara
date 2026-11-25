# PlataClara
cat > README.md << 'EOF'
# PlataClara

Página web sencilla para registrar tus gastos del mes y ver en qué se te va la plata.

## Captura de pantalla

![PlataClara funcionando](screenshot.png)

## Funciones

- Registro de gastos con monto, categoría, fecha y descripción
- Total del mes y número de gastos
- Resumen con total por categoría y barras de proporción
- Lista de gastos con opción de eliminar y filtro por categoría
- Botón para borrar todos los gastos, con confirmación
- Diseño adaptable a celular

## Cómo ejecutar el proyecto

No necesita instalar nada, solo un navegador.

1. Clona el repositorio: `git clone https://github.com/JhonatanJG/plataclara.git`
2. Entra a la carpeta: `cd plataclara`
3. Abre el archivo `index.html` en el navegador (doble clic, o `explorer.exe index.html` si usas WSL).

Los datos son de ejemplo y se guardan solo en el navegador (localStorage).

## Tecnologías utilizadas

- HTML, CSS y JavaScript (sin librerías externas)
- localStorage para guardar los datos en el navegador
- Git y GitHub para el control de versiones
- WSL (Ubuntu) y OpenCode como entorno y asistente de programación
- Fizzy (tablero de trabajo) y Excalidraw (mockups)

## Referencias

37signals. (s. f.). *Fizzy: A modern spin on kanban for tracking anything*. https://www.fizzy.do

Excalidraw. (s. f.). *Excalidraw*. https://excalidraw.com

Git. (s. f.). *Git documentation*. https://git-scm.com/doc

GitHub. (s. f.). *Quickstart for repositories*. GitHub Docs. https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories

MDN Web Docs. (s. f.). *Window: localStorage property*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

Microsoft. (s. f.). *How to install Linux on Windows with WSL*. Microsoft Learn. https://learn.microsoft.com/en-us/windows/wsl/install

OpenCode. (s. f.). *OpenCode: The open source AI coding agent*. https://opencode.ai
EOF
git add .
git commit -m "Agrega README completo y captura de pantalla"
git push
