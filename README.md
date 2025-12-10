PachaQutec - Turismo Arequipa
Plataforma móvil integral para el turismo en Arequipa

## Descripción

**PachaQutec** es una aplicación móvil diseñada para enriquecer la experiencia turística en la ciudad de Arequipa. Utilizando una arquitectura modular y escalable, la aplicación conecta a los usuarios con lugares emblemáticos, gastronomía y rutas personalizadas.

El sistema se apoya en un backend robusto híbrido (C++ y Python) desplegado en un VPS Linux, garantizando alto rendimiento y capacidades de inteligencia artificial.

---

## Arquitectura del Sistema

La aplicación sigue un flujo de datos unidireccional y una separación clara de responsabilidades:

1.  **Components (UI):** Componentes de React Native encargados exclusivamente del renderizado y captura de inputs.
2.  **State (Estado):** Gestión centralizada (Redux Toolkit/Zustand) y local (Context API) para la lógica de presentación.
3.  **Logic/Services:** Hooks personalizados y servicios que comunican con las APIs REST y manejan la lógica de negocio (Entidades: Lugar Turístico, Usuario, Ruta).

### Infraestructura de Backend

El sistema consume servicios alojados en un VPS (Ubuntu Server) con dominio personalizado y SSL habilitado:

* ** Drogon (C++):** API REST principal para autenticación, CRUD de usuarios, lugares y favoritos.
* ** FastAPI (Python):** Microservicio dedicado al asistente de Inteligencia Artificial.
* ** Nginx:** Proxy inverso para servir la aplicación y gestionar la seguridad.

---

##  Vistas Previas (UI/UX)

La aplicación cuenta con una interfaz intuitiva diseñada para la facilidad de uso.

[Figma](https://www.figma.com/design/K5guqwm9ujQRGbp6aBiAc2/Sin-t%C3%ADtulo?node-id=33-2&p=f&t=FNPkjatQBBZ5PrLu-0)

##  Instalación y Despliegue Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

###  Prerrequisitos

Asegúrate de tener instalado lo siguiente:
* [Node.js](https://nodejs.org/) & npm
* [Python 3.9+](https://www.python.org/)
* [Docker & Docker Compose](https://www.docker.com/)
* [Expo CLI](https://docs.expo.dev/get-started/installation/)

###  Pasos de Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/tu-usuario/pachaqutec.git](https://github.com/tu-usuario/pachaqutec.git)
    cd pachaqutec
    ```

2.  **Instalar dependencias del Frontend (Móvil)**
    ```bash
    cd mobile-app
    npm install
    # o si usas yarn
    yarn install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz del proyecto móvil basándote en el ejemplo:
    ```env
    API_URL_DROGON=[https://api.pachaqutec.com](https://api.pachaqutec.com)
    API_URL_FASTAPI=[https://ai.pachaqutec.com](https://ai.pachaqutec.com)
    ```

4.  **Levantar el Backend (Opcional - Docker)**
    Si deseas correr el backend localmente en lugar de usar el VPS:
    ```bash
    cd backend
    docker-compose up -d
    ```

5.  **Ejecutar la Aplicación Móvil**
    ```bash
    npx expo start
    ```
---

##  Tecnologías

* **Frontend:** React Native, Expo, TypeScript.
* **Gestión de Estado:** (Redux Toolkit / Zustand / Context API).
* **Backend Core:** C++ (Framework Drogon).
* **Backend AI:** Python (FastAPI).
* **Base de Datos:** (Especificar BD, ej. PostgreSQL/MySQL).
* **Despliegue:** VPS Linux (Ubuntu), Docker, Nginx.

---

## Licencia

Este proyecto es de carácter académico.
