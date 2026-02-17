<h1 align="center">
  safeFetch
  <br />
  <img src="https://github.com/alexfalconflores/safe-fetch/blob/4fd0a9af158b69fa3bab5861ce13c552203845d9/logo.svg" alt="safeFetch logo" width="150"/>
</h1>

<p align="center">
  <strong>HTTP client tipado, listo para producción, para apps modernas en TypeScript.</strong><br />
  Un wrapper ligero y sin dependencias alrededor de <code>fetch</code> con reintentos, timeouts, interceptores, abortAll y tipado fuerte.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@alexfalconflores/safe-fetch">
    <img src="https://img.shields.io/npm/v/@alexfalconflores/safe-fetch?style=flat-square" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/@alexfalconflores/safe-fetch">
    <img src="https://img.shields.io/npm/dm/@alexfalconflores/safe-fetch?style=flat-square" alt="Downloads" />
  </a>
  <a href="https://github.com/alexfalconflores/safe-fetch/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/alexfalconflores/safe-fetch?style=flat-square" alt="License" />
  </a>
</p>

---

## 🚀 ¿Por qué safeFetch?

El `fetch` nativo es genial, pero en apps reales siempre terminamos escribiendo lo mismo:

- Manejo de errores repetitivo.
- Transformar respuestas a JSON.
- Añadir headers comunes.
- Manejar **timeouts**, **reintentos**, **abortController**, etc.

**safeFetch** resuelve todo esto sin la pesadez de Axios.

- ✨ Tipado fuerte con genéricos `<T>` en las respuestas.
- 🔄 Reintentos automáticos en errores de red o respuestas 5xx.
- ⏱️ Timeouts configurables por request.
- 🛑 `abortAll()` para cancelar todas las peticiones de una instancia.
- 🪝 Interceptores (`onRequest`, `onResponse`, `onResponseError`).
- 🧠 Handlers de status HTTP (on200, on401, on500, etc).
- 🔍 Modo debug con comandos **cURL** listos para copiar/pegar.
- 🍬 Azúcar sintáctica: `.get()`, `.post()`, `.put()`, `.delete()`, `.patch()`.
- 📦 Tipos para headers comunes (`Content-Type`, `Authorization`, `Accept`, etc).

---

## 📦 Instalación

```bash
npm install @alexfalconflores/safe-fetch
# o
bun add @alexfalconflores/safe-fetch
```

---

## 💻 Uso básico

### 1. Singleton por defecto

Para casos simples, usa la instancia por defecto `safeFetch`:

```ts
import safeFetch from "@alexfalconflores/safe-fetch";

interface User {
  id: number;
  name: string;
}

/**
 * 1) Sugar syntax (get/post)
 *    Great for most day‑to‑day use cases.
 */

// Typed GET + automatic JSON parsing
const users = await safeFetch.get<User[]>("/api/users");

// POST with body automatically serialized to JSON
await safeFetch.post("/api/users", { name: "Alex" });

/**
 * 2) Core usage (no sugar)
 *    Same instance, but calling the underlying request function directly.
 *    Useful if you want full control over method, body and options.
 */

// Equivalent GET without .get()
const usersCore = await safeFetch("/api/users", {
  method: "GET",
  timeout: 5000, // 5 segundos
  // You can also add headers, params, timeout, etc. here
});

// Equivalent POST without .post()
await safeFetch("/api/users", {
  method: "POST",
  body: { name: "Alex" }, // Will be JSON‑stringified automatically
  headers: {
    "Content-Type": "application/json",
  },
});
```

Internamente:

- Si el método no es `GET`/`HEAD` y el body es un objeto, se serializa como JSON.
- Si no defines `Content-Type`, se usa `"application/json"` por defecto.

---

## 🏭 Patrón recomendado: `createSafeFetch`

Lo ideal es crear **instancias aisladas por API** (Backend, terceros, etc).

```ts
import { createSafeFetch } from "@alexfalconflores/safe-fetch";

export const api = createSafeFetch({
  debug: true, // Imprime logs y cURL cuando algo falla
  baseUrl: "https://api.myapp.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
  onRequest: async (url, config) => {
    const session = await getSession();
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${session?.backend_token}`,
      ...(await buildAuditHeaders()),
    };
    return config;
  },
  on401: async () => {
    console.error("Unauthorized: Redirecting to login page.");
  },
});

// Ejemplo de uso
interface DashboardResponse {
  stats: {
    users: number;
    sales: number;
  };
}

// Sin Azucar
const res = await api("/dashboard", {
  method: "GET",
  timeout: TIMEOUT,
  next: { tags: [GET_BRANDS_TAG], revalidate: CRUD_REVALIDATE_SECONDS }, // Si usas Next.js
});

const data = await api.get<DashboardResponse>("/dashboard");
console.log(data.stats.users);
```

### Actualizar configuración en caliente

Puedes actualizar ‎`baseUrl`, `headers` y `handlers` sin crear una nueva instancia.
Un patrón muy común (especialmente en frameworks como Next.js) es configurar ‎`safeFetch` una sola vez y luego simplemente importarlo donde lo necesites.

```ts
// config.ts
// Configuración global para la instancia por defecto de safeFetch

import safeFetch from "@alexfalconflores/safe-fetch";
import { getSession } from "./auth";
import { buildAuditHeaders } from "./audit";

safeFetch.configure({
  baseUrl: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  onRequest: async (url, config) => {
    const session = await getSession();
    config.headers = {
      ...config.headers,
      Authorization: session?.backend_token
        ? `Bearer ${session.backend_token}`
        : undefined,
      ...(await buildAuditHeaders()),
    };
    return config;
  },
  on401: async () => {
    console.error("Unauthorized: Redirecting to login page.");
    // redirectToLogin(); // tu lógica aquí
  },
});
```

Luego importas esta configuración una sola vez en el nivel más alto de tu app (para que se ejecute antes de cualquier request):

> `app/layout.tsx` (o tu archivo de entrada principal)

```ts
import "./config.ts";
```

A partir de ahí, en cualquier parte de tu código puedes usar ‎`safeFetch` ya configurado

```ts
import safeFetch from "@alexfalconflores/safe-fetch";

const usersCore = await safeFetch("/api/users", {
  method: "GET",
  timeout: 5000, // 5 segundos
  // You can also add headers, params, timeout, etc. here
});
```

---

Si creas una instancia personalizada con ‎`createSafeFetch`, también puedes re‑configurarla.

```ts
import { createSafeFetch } from "@alexfalconflores/safe-fetch";

const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
});

api.configure({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

> La configuración nueva se fusiona con la anterior (los headers se mezclan, no se reemplazan completamente).

---

## 🪝 Interceptores y manejo global

### `onRequest`: inyectar token, modificar URL, etc.

```ts
const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
  async onRequest(url, config) {
    const token = localStorage.getItem("token");
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };
  },
});
```

### `onResponse`: logging global

```ts
const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
  onResponse(response) {
    console.log("[HTTP]", response.status, response.url);
  },
});
```

### `onResponseError`: refrescar token / reintento transparente

```ts
const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
  async onResponseError(response, attempt) {
    // Primer 401 ➜ intenta refrescar token y reintentar
    if (response.status === 401 && attempt === 0) {
      await refreshToken(); // Tu lógica
      // Reintenta la misma URL con la nueva configuración
      return api.request(response.url, {
        method: response.request?.method ?? "GET",
        // Puedes pasar aquí init original si lo guardas tú mismo
        responseType: "response",
      });
    }
  },
});
```

> Nota: en tu app real, conviene guardar el `init` original para reusarlo al reintentar.

---

## 🧠 Handlers por status HTTP

safeFetch te permite asociar callbacks a códigos HTTP específicos.

En lugar de hacer ‎`console.log`, lo normal es delegar en servicios compartidos (auth, notificaciones, métricas, etc.).

Ejemplo: centralizar sesión expirada, notificaciones y reporting

Supongamos que tienes tres utilidades simples:

```ts
// auth.ts
export function forceLogout() {
  // Limpia tokens, estado global, etc.
  localStorage.removeItem("token");
  // Podrías usar tu router aquí
  window.location.href = "/login";
}

// notifications.ts
export function notifyError(message: string) {
  // Aquí podrías integrar Sonner, Toastify, Radix, lo que uses en tu app
  // Por ejemplo:
  // toast.error(message);
  console.error("[UI ERROR]", message);
}

// monitoring.ts
export function reportError(error: unknown) {
  // En un proyecto real: enviar a Sentry, Datadog, LogRocket, etc.
  console.error("[REPORT ERROR]", error);
}
```

Ahora conectas todo desde ‎`createSafeFetch`:

```ts
import { createSafeFetch } from "@alexfalconflores/safe-fetch";
import { forceLogout } from "./auth";
import { notifyError } from "./notifications";
import { reportError } from "./monitoring";

const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
  // 4xx: errores de cliente
  async on400(response) {
    // Ejemplo: extraer errores de validación y mostrarlos en la UI
    try {
      const data = await response.json();
      const message =
        data?.message ?? "Tu solicitud contiene datos inválidos (400).";
      notifyError(message);
    } catch {
      notifyError("Tu solicitud contiene datos inválidos (400).");
    }
  },
  async on401() {
    // Sesión expirada ➜ forzar logout y redirigir a login
    notifyError("Tu sesión ha expirado. Ingresa nuevamente.");
    forceLogout();
  },
  on403() {
    // Sin permisos ➜ mostrar mensaje genérico
    notifyError("No tienes permisos para realizar esta acción (403).");
  },
  on404() {
    // Recurso no encontrado ➜ podrías actualizar un store de routing
    notifyError("Recurso no encontrado (404).");
  },
  // 5xx: errores de servidor
  async on500(response) {
    notifyError("Estamos teniendo problemas en el servidor. Inténtalo más tarde.");
    reportError({
      status: response.status,
      url: response.url,
    });
  },
  // Error de red (sin respuesta HTTP)
  onError(error) {
    notifyError("Parece que no tienes conexión a Internet.");
    reportError(error);
  },
});
```

En tu código de negocio solo usas ‎`api` normalmente:
```ts
// Ejemplo en un servicio de dominio / React hook
export async function fetchCurrentUser() {
  const user = await api.get<User>("/me");
  return user;
}
```
>💡 Así mantienes la lógica de red en un solo lugar (safeFetch + handlers)
> y tu UI solo se conecta a utilidades como ‎`notifyError`, ‎`forceLogout`, etc.

Además de los handlers específicos (`on200`, `on404`, `on503`, etc.), también tienes:

- `onError(error)`: cuando falla la red (sin Internet, DNS, CORS, timeout, abort).
- `onResponse(response)`: se ejecuta siempre que haya respuesta (2xx, 3xx, 4xx, 5xx).

---

## ⏱️ Timeouts y reintentos

### Timeout por petición

```ts
const user = await api.get<User>("/users/1", {
  timeout: 5000, // 5 segundos
});
```

Si se supera el tiempo:

- Se aborta la request.
- Se lanza un error con el mensaje `Request timeout after 5000ms`.

### Reintentos en errores de red / 5xx

```ts
const data = await api.get("/flaky-endpoint", {
  retries: 3, // 3 reintentos
  retryDelay: 1000, // 1s entre reintento y reintento
  timeout: 4000, // Máximo 4s por intento
});
```

El flujo es:

1. Intento 1 → falla (red o 5xx) → espera 1s.
2. Intento 2 → falla → espera 1s.
3. Intento 3 → falla → lanza el último error capturado.

---

## 🛑 Cancelar todas las requests (`abortAll`)

Cada instancia de `safeFetch` mantiene su propio conjunto de `AbortController`.

Esto es perfecto para React, al desmontar componentes:

```ts
import { useEffect, useState } from "react";
import { createSafeFetch } from "@alexfalconflores/safe-fetch";

const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
});

function HeavyComponent() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get("/heavy-data")
      .then(setData)
      .catch((err) => {
        if (err.message === "Request aborted by safeFetch.abortAll()") return;
        console.error(err);
      });

    return () => {
      api.abortAll(); // Cancela TODO lo que siga pendiente
    };
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

---

## 🔍 Query params fáciles

Olvídate de construir `URLSearchParams` a mano:

```ts
// Genera: GET /search?q=books&page=2&tags=a&tags=b
await api.get("/search", {
  params: {
    q: "books",
    page: 2,
    tags: ["a", "b"],
  },
});
```

- `undefined` y `null` se ignoran.
- Los arrays se convierten en múltiples query params.

---

## 📥 Tipos de respuesta (`responseType`)

Por defecto, intenta parsear JSON (`responseType: "json"`). Si el backend no devuelve JSON válido, retorna el `text` crudo.:

```ts
// Texto plano (HTML, CSV, etc.)
const html = await api.get<string>("/page", {
  responseType: "text",
});

// Blob (archivos, imágenes, PDFs)
const file = await api.get<Blob>("/report.pdf", {
  responseType: "blob",
});

// ArrayBuffer (binarios para procesar a bajo nivel)
const buffer = await api.get<ArrayBuffer>("/binary", {
  responseType: "arrayBuffer",
});

// Response nativo sin procesar (tú te encargas del manejo)
const response = await api.get<Response>("/raw", {
  responseType: "response",
});
```

---

## 🧱 Headers tipados (quality-of-life)

`HeadersType` te da **autocompletado y seguridad de tipos** para la mayoría de headers HTTP comunes:

```ts
import {
  createSafeFetch,
  type HeadersType,
} from "@alexfalconflores/safe-fetch";

const defaultHeaders: HeadersType = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${myToken}`,
  Accept: "application/json",
  "Cache-Control": "no-cache",
};

const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
  headers: {
    "Content-Type": "application/json",
    // Headers custom siguen siendo válidos
    "X-Request-Source": "dashboard-web",
  },
});
```

También puedes usar valores personalizados si lo necesitas.

---

## 🛠 Utilidades: `Join`

Pequeño helper para unir strings o arrays:

```ts
import { Join } from "@alexfalconflores/safe-fetch";

const date = Join("-", "2025", "04", "19"); // "2025-04-19"
const classes = Join(" ", "btn", ["btn-primary", "btn-lg"]); // "btn btn-primary btn-lg"
```

---

## 🧩 Compatibilidad

Funciona en todos los runtimes modernos:

- ✅ Navegador (Chrome, Firefox, Safari, Edge)
- ✅ Node.js (v18+ o con polyfill de `fetch`)
- ✅ Bun
- ✅ Deno

---

## 👤 Autor

Alex Stefano Falcon Flores

- 🐙 GitHub: [alexfalconflores](https://github.com/alexfalconflores)
- 💼 LinkedIn: [alexfalconflores](https://www.linkedin.com/in/alexfalconflores/)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Revisa el archivo [LICENSE](./LICENSE) para más detalles.

<p align="center">
⭐ <strong>¿Te sirve?</strong> Dale una estrella en GitHub.<br />
Construido con ❤️ en Perú 🇵🇪
</p>
