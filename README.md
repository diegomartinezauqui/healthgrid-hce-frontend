#  Health Grid - Módulo 1: Historia Clínica Electrónica (Frontend)

Este repositorio contiene el código fuente del frontend para el Módulo de Historia Clínica Electrónica (HCE), desarrollado para el sistema integrado **Health Grid** de la materia Desarrollo de Aplicaciones II.

##  Stack Tecnológico
* **Framework:** React.js
* **Build Tool:** Vite
* **Lenguaje:** JavaScript / JSX
* **Estilos:** CSS (Inline styles y módulos base)

##  Guía de Instalación y Ejecución

Para levantar este proyecto en tu entorno local (o en GitHub Codespaces), seguí estos pasos:

### 1. Prerrequisitos
Asegurate de tener instalado **Node.js** (versión 18 o superior). Podés verificarlo corriendo en tu terminal:
\`\`\`bash
node -v
\`\`\`

### 2. Instalación de dependencias
Cloná este repositorio y, dentro de la carpeta raíz (`healthgrid-hce-frontend`), ejecutá el siguiente comando para instalar todas las librerías necesarias:
\`\`\`bash
npm install
\`\`\`

### 3. Levantar el entorno de desarrollo
Una vez instaladas las dependencias, iniciá el servidor local de Vite con:
\`\`\`bash
npm run dev
\`\`\`
El proyecto estará disponible en `http://localhost:5173/` (o en el puerto que te indique la terminal). Vite soporta *Hot Module Replacement* (HMR), por lo que cualquier cambio que guardes en el código se reflejará al instante en el navegador.

##  Estructura del Proyecto

* `/src/components/`: Piezas de interfaz reutilizables (Ej: `Sidebar.jsx`).
* `/src/pages/`: Vistas principales de la aplicación (Ej: `Home.jsx`).
* `/src/App.jsx`: Componente raíz y enrutador principal.
* `/src/index.css`: Estilos globales y reset del navegador.
