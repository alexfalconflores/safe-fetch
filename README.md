<h1 align="center">
  safeFetch
  <br />
  <img src="https://github.com/alexfalconflores/safe-fetch/blob/4fd0a9af158b69fa3bab5861ce13c552203845d9/logo.svg" alt="safeFetch logo" width="150"/>
</h1>

<p align="center">
<strong>Typed, production‑ready HTTP client for modern TypeScript apps.</strong><br />
A lightweight, zero‑dependency wrapper around <code>fetch</code> with retries, timeouts, interceptors, abortAll and strong typing.
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

## 🚀 Why safeFetch?

Native ‎`fetch` is great, but in real apps we always end up writing the same things:

- Repetitive error handling.
- Converting responses to JSON.
- Adding common headers.
- Dealing with timeouts, retries, AbortController, etc.

safeFetch solves all of this without the heaviness of Axios.

- ✨ Strong typing with ‎`<T>` generics on responses.
- 🔄 Automatic retries on network errors or 5xx responses.
- ⏱️ Per‑request configurable timeouts.
- 🛑 ‎`abortAll()` to cancel all pending requests for an instance.
- 🪝 Interceptors (‎`onRequest`, ‎`onResponse`, ‎`onResponseError`).
- 🧠 HTTP status handlers (on200, on401, on500, etc).
- 🔍 Debug mode with ready‑to‑paste cURL commands.
- 🍬 Sugar syntax: ‎`.get()`, ‎`.post()`, ‎`.put()`, ‎`.delete()`, ‎`.patch()`.
- 📦 Typed headers for common cases (‎`Content-Type`, ‎`Authorization`, ‎`Accept`, etc).

---

## 📦 Installation

```bash
npm install @alexfalconflores/safe-fetch
# or
bun add @alexfalconflores/safe-fetch
```

---

## 💻 Basic usage

### 1. Default singleton

For simple cases, use the default ‎`safeFetch` instance:

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

Under the hood:

- If the method is not ‎`GET`/‎`HEAD` and the body is an object, it will be serialized as JSON.
- If you don’t define ‎`Content-Type`, ‎`"application/json"` is used by default.

---

## 🏭 Recommended pattern: ‎`createSafeFetch

The ideal setup is to create **isolated instances per API** (backend, third‑party services, etc).

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

### Update configuration on the fly

You can update ‎`baseUrl`, ‎`headers` and ‎`handlers` without creating a new instance.

A common pattern (especially in frameworks like Next.js) is to configure ‎`safeFetch` once and then simply import it wherever you need it.

```ts
// config.ts
// Global configuration for the default safeFetch instance

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
    // redirectToLogin(); // your logic here
  },
});
```

Then import this configuration once at the top level of your app (so it runs before any requests):

> `app/layout.tsx` (or your main entry file)

```ts
import "./config.ts";
```

From that point on, you can use the already configured ‎`safeFetch` anywhere in your code:

```ts
import safeFetch from "@alexfalconflores/safe-fetch";

const usersCore = await safeFetch("/api/users", {
  method: "GET",
  timeout: 5000, // 5 segundos
  // You can also add headers, params, timeout, etc. here
});
```

---

If you create a custom instance with ‎`createSafeFetch`, you can also re‑configure it:

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

> New configuration is merged with the existing one (headers are merged, not fully replaced).

---

## 🪝 Interceptores y manejo global

### `onRequest`: inject token, tweak URL, etc.

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

### `onResponse`: global logging

```ts
const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
  onResponse(response) {
    console.log("[HTTP]", response.status, response.url);
  },
});
```

### `onResponseError`: refresh token / transparent retry

```ts
const api = createSafeFetch({
  baseUrl: "https://api.myapp.com",
  async onResponseError(response, attempt) {
    // First 401 ➜ try to refresh token and retry
    if (response.status === 401 && attempt === 0) {
      await refreshToken(); // Tu lógica
      // Retry the same URL with the new configuration
      return api.request(response.url, {
        method: response.request?.method ?? "GET",
        // You can pass the original init here if you store it yourself
        responseType: "response",
      });
    }
  },
});
```

> Note: in a real app, it’s usually better to store the original ‎`init` so you can reuse it when retrying.

---

## 🧠 HTTP status handlers

safeFetch lets you attach callbacks to specific HTTP status codes.

Instead of doing ‎`console.log`, it’s more realistic to delegate to shared services (auth, notifications, monitoring, etc.).

Example: centralize expired session handling, notifications and reporting.

Assume you have three simple utilities:

```ts
// auth.ts
export function forceLogout() {
  // Clear tokens, global state, etc.
  localStorage.removeItem("token");
  // You can use your router here
  window.location.href = "/login";
}

// notifications.ts
export function notifyError(message: string) {
  // Here you could integrate Sonner, Toastify, Radix, etc.
  // Por ejemplo:
  // toast.error(message);
  console.error("[UI ERROR]", message);
}

// monitoring.ts
export function reportError(error: unknown) {
  // In a real project: send to Sentry, Datadog, LogRocket, etc.
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
    // Example: extract validation errors and show them in the UI
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
    // Session expired ➜ force logout and redirect to login
    notifyError("Tu sesión ha expirado. Ingresa nuevamente.");
    forceLogout();
  },
  on403() {
    // No permissions ➜ show generic message
    notifyError("No tienes permisos para realizar esta acción (403).");
  },
  on404() {
    // Resource not found ➜ you may update a routing store, etc.
    notifyError("Recurso no encontrado (404).");
  },
  // 5xx: server errors
  async on500(response) {
    notifyError("Estamos teniendo problemas en el servidor. Inténtalo más tarde.");
    reportError({
      status: response.status,
      url: response.url,
    });
  },
  // Network error (no HTTP response)
  onError(error) {
    notifyError("Parece que no tienes conexión a Internet.");
    reportError(error);
  },
});
```

In your business code you just use ‎`api` normally:
```ts
// Example in a domain service / React hook
export async function fetchCurrentUser() {
  const user = await api.get<User>("/me");
  return user;
}
```
>💡 This keeps all network logic in one place (safeFetch + handlers)
and your UI only talks to utilities like ‎`notifyError`, ‎`forceLogout`, etc.

Besides specific handlers (‎`on200`, ‎`on404`, ‎`on503`, etc.), you also have:

- ‎`onError(error)`: when the network fails (no Internet, DNS, CORS, timeout, abort).
- ‎`onResponse(response)`: runs whenever there is a response (2xx, 3xx, 4xx, 5xx).

---

## ⏱️ Timeouts and retries

### Per‑request timeout

```ts
const user = await api.get<User>("/users/1", {
  timeout: 5000, // 5 segundos
});
```

If the timeout is exceeded:

- The request is aborted.
- An error is thrown with the message ‎`Request timeout after 5000ms`.

### Retries on network / 5xx errors

```ts
const data = await api.get("/flaky-endpoint", {
  retries: 3, // 3 retries
  retryDelay: 1000, // 1s between retries
  timeout: 4000, // Max 4s per attempt
});
```

Execution flow:

1. Attempt 1 → fails (network or 5xx) → wait 1s.
2. Attempt 2 → fails → wait 1s.
3. Attempt 3 → fails → throw the last captured error.

---

## 🛑 Cancel all requests (`abortAll`)

Each ‎`safeFetch` instance keeps its own set of ‎`AbortController`s.

This is perfect for React when unmounting components:

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
      api.abortAll(); // Cancels ALL pending requests for this instance
    };
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

---

## 🔍 Easy query params

Forget about building ‎`URLSearchParams` manually:

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

- ‎`undefined` and ‎`null` are ignored.
- Arrays become multiple query params.

---

## 📥 Response types (‎`responseType`)

By default, safeFetch tries to parse the response as JSON (‎`responseType: "json"`).
If the backend does not return valid JSON, it falls back to returning the raw ‎`text`.

```ts
// Plain text (HTML, CSV, etc.)
const html = await api.get<string>("/page", {
  responseType: "text",
});

// Blob (archivos, imágenes, PDFs)
const file = await api.get<Blob>("/report.pdf", {
  responseType: "blob",
});

// ArrayBuffer (binary data for low‑level processing)
const buffer = await api.get<ArrayBuffer>("/binary", {
  responseType: "arrayBuffer",
});

// Raw native Response (you handle parsing yourself)
const response = await api.get<Response>("/raw", {
  responseType: "response",
});
```

---

## 🧱 Typed headers (quality‑of‑life)

‎`HeadersType` gives you autocomplete and type safety for most common HTTP headers:

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

You still keep full flexibility for custom headers, while getting strong typing and autocomplete for the standard ones.

---

## 🛠 Utility: `Join`

Small helper to join strings or arrays:

```ts
import { Join } from "@alexfalconflores/safe-fetch";

const date = Join("-", "2025", "04", "19"); // "2025-04-19"
const classes = Join(" ", "btn", ["btn-primary", "btn-lg"]); // "btn btn-primary btn-lg"
```

---

## 🧩 Compatibility

Works in all modern runtimes:

- ✅ Browser (Chrome, Firefox, Safari, Edge)
- ✅ Node.js (v18+ or with a ‎`fetch` polyfill)
- ✅ Bun
- ✅ Deno

---

## 👤 Author

Alex Stefano Falcon Flores

- 🐙 GitHub: [alexfalconflores](https://github.com/alexfalconflores)
- 💼 LinkedIn: [alexfalconflores](https://www.linkedin.com/in/alexfalconflores/)
- 🌐 Website: [alexfalconflores](https://www.alexfalconflores.com/)

---

## 📄 Licencia

This project is licensed under the MIT license. See the LICENSE ↗ file for more details.

<p align="center">

⭐ <strong>Find it useful?</strong> Give it a star on GitHub.<br />

Built with ❤️ in Peru 🇵🇪

</p>
