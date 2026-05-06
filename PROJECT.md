# aesthetic — Contexto del proyecto

## Qué es

**aesthetic** es una plataforma SaaS de gestión para estudios de belleza y peluquerías del mercado argentino. Permite al dueño/a del negocio administrar turnos, clientes, servicios y comunicación con clientes vía WhatsApp, todo desde una sola interfaz web.

El modelo de uso es **un negocio = una cuenta**. No hay marketplace ni multi-tenant visible al cliente final; cada estudio tiene su propio acceso y sus propios datos.

---

## Usuario objetivo

Dueños/as de estudios de belleza, peluquerías y centros de estética pequeños/medianos en Argentina. El caso base es una dueña que atiende sola o con 1-2 empleadas, gestiona los turnos manualmente por WhatsApp y quiere automatizar esa parte.

---

## Módulos

### Dashboard (`/dashboard`)
Vista de resumen del día. Muestra KPIs (turnos del día, confirmados, pendientes, ingresos estimados), la agenda del día en formato timeline y actividad reciente (acciones del bot, pagos, cancelaciones).

### Agenda (`/agenda`)
Vista de calendario. Permite ver turnos por semana/día y navegar entre fechas.

### Turnos (`/turnos`)
Listado completo de turnos con filtros por estado (confirmado, pendiente, completado, cancelado). Permite crear nuevos turnos desde un modal (cliente + servicio + fecha + hora + notas).

### Clientes (`/clientes`)
CRM básico. Lista de clientes con búsqueda y agrupación alfabética. Al seleccionar un cliente se ve su perfil completo: datos de contacto, estadísticas (visitas, total gastado, última visita, ticket promedio), notas privadas e historial de turnos.

### WhatsApp (`/whatsapp`)
Bandeja de conversaciones de WhatsApp. Cada chat muestra los mensajes entre el cliente, el bot y la dueña. El bot puede gestionar turnos automáticamente (confirmaciones, recordatorios, nuevas reservas). La dueña puede tomar el control del chat en cualquier momento.

### Servicios (`/servicios`)
Catálogo de servicios del estudio. Cada servicio tiene nombre, categoría, duración en minutos, precio y visibilidad (puede ocultarse sin eliminarlo).

### Mi negocio (`/negocio`)
Perfil del negocio: nombre, teléfono, dirección, Instagram, sitio web, logo y horarios de atención por día. Incluye preview del mensaje de bienvenida que usa el bot.

### Configuración (`/config`)
Ajustes de la cuenta y de la app (notificaciones, preferencias, etc.).

---

## Entidades principales

### `Business`
El estudio/salón. Tiene nombre, datos de contacto, redes sociales, logo y horarios de atención por día de la semana.

### `User`
El dueño/a o personal del negocio. Tiene email, contraseña, nombre y rol (`owner` | `staff`). Pertenece a un `Business`.

### `Client`
Cliente del estudio. Tiene nombre, teléfono, email y notas privadas. El teléfono es el identificador clave para relacionarlo con chats de WhatsApp. Las estadísticas (visitas, total gastado) son campos computados o cacheados desde `Appointment`.

### `Service`
Servicio ofrecido. Tiene nombre, categoría (Corte, Color, Tratamiento, Uñas, etc.), duración en minutos, precio, color de UI y flag de visibilidad.

### `Appointment`
Turno. Relaciona un `Client` con un `Service` en una fecha/hora. El precio y la duración se **desnormalizan** en el momento de la reserva (snapshot) para que cambios futuros al servicio no alteren el historial. Estado: `pending` | `confirmed` | `completed` | `cancelled`.

### `WhatsappChat`
Conversación de WhatsApp entre el negocio y un número de teléfono. Puede estar asociada a un `Client` registrado o no. Tiene flag `is_bot` que indica si el bot está manejando la conversación.

### `WhatsappMessage`
Mensaje individual dentro de un chat. El `sender` puede ser `client`, `owner` o `bot`.

### `BusinessHours`
Horario de atención por día de la semana para un `Business`.

---

## Relaciones clave

```
Business 1──* User
Business 1──* Client
Business 1──* Service
Business 1──* Appointment
Business 1──* WhatsappChat
Business 1──7 BusinessHours

Client   1──* Appointment
Client   1──* WhatsappChat
Service  1──* Appointment

WhatsappChat 1──* WhatsappMessage
```

---

## Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, TypeScript
- **Backend**: a definir (se espera API REST o tRPC)
- **Base de datos**: PostgreSQL via Drizzle ORM
- **Auth**: a definir
- **WhatsApp**: integración con API de WhatsApp Business (webhook entrante + envío de mensajes)

---

## Schema



## Notas para el backend

- Los precios están en **pesos argentinos** (ARS), sin decimales (entero).
- Las fechas de turnos son `date` (YYYY-MM-DD) y la hora es `time` (HH:MM) por separado, para facilitar queries de agenda por día.
- El `clientPhone` se usa como clave de matching entre `Client` y `WhatsappChat`. Si llega un mensaje de un número no registrado, se crea el chat igual y se linkea el cliente después.
- El bot de WhatsApp puede confirmar, recordar y crear turnos. El backend debe exponer endpoints que el bot pueda consumir para consultar disponibilidad y crear `Appointment`.
- `visits` y `totalSpent` en `Client` pueden mantenerse como campos cacheados y actualizarse cada vez que un `Appointment` cambia a `completed`, para evitar queries costosas en el dashboard.
