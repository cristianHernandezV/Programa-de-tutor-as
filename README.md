# Clara | Gestor de tareas

Aplicación web de gestión de tareas desarrollada con HTML5, CSS3 y JavaScript Vanilla. Incluye registro e inicio de sesión simulados, organización de tareas y persistencia local mediante `localStorage`.

## Características

- Registro de usuarios simulado.
- Inicio y cierre de sesión.
- Creación, edición y eliminación de tareas.
- Marcar tareas como completadas o pendientes.
- Prioridades: baja, media y alta.
- Fecha límite y detección de tareas vencidas.
- Notas adicionales para cada tarea.
- Búsqueda de tareas.
- Filtros por todas, pendientes y completadas.
- Ordenamiento por fecha de creación, prioridad o fecha límite.
- Estadísticas de progreso.
- Tema claro y oscuro.
- Preferencia de tema persistente después de recargar o cerrar la página.
- Diseño responsive para escritorio, tablet y móvil.

## Tecnologías

- HTML5
- CSS3
- JavaScript ES6+
- `localStorage`
- Google Fonts: DM Sans y Playfair Display

No utiliza frameworks como React, Angular o Vue.

## Estructura del proyecto

```text
Tutorias/
├── index.html    # Estructura de la aplicación
├── styles.css    # Estilos, temas y diseño responsive
├── app.js        # Lógica de autenticación, tareas y persistencia
└── README.md     # Documentación del proyecto
```

## Cómo ejecutar

No requiere instalación de dependencias ni servidor backend.

1. Abre `index.html` directamente en un navegador.
2. Selecciona **Crear cuenta**.
3. Registra un nombre, correo y contraseña de al menos seis caracteres.
4. Inicia sesión y comienza a gestionar tus tareas.

También puedes abrir la carpeta en Visual Studio Code y utilizar una extensión como **Live Server** para ejecutarlo con un servidor local.

## Persistencia de datos

La aplicación guarda los datos en el almacenamiento local del navegador:

| Clave | Contenido |
| --- | --- |
| `todo_users` | Usuarios registrados y sus tareas |
| `todo_current_user` | Correo del usuario con sesión activa |
| `todo_theme` | Preferencia de tema: `light` o `dark` |

Los datos permanecen disponibles al recargar o volver a abrir la aplicación en el mismo navegador y origen.

## Aviso de seguridad

El registro es exclusivamente simulado para fines educativos. Las contraseñas se almacenan en `localStorage` sin cifrado, por lo que no deben utilizarse credenciales reales ni datos sensibles.

Para un sistema real sería necesario implementar un backend, autenticación segura, hash de contraseñas, validación del servidor y una base de datos.

## Compatibilidad

Funciona en navegadores modernos con soporte para:

- JavaScript ES6+
- `localStorage`
- CSS Custom Properties
- CSS Grid y Flexbox
- `crypto.randomUUID()` con alternativa compatible incluida

## Licencia

Proyecto educativo y de demostración.
