<h1 align="center">
    safeFetch
  <br />
  <img src="https://github.com/alexfalconflores/safe-fetch/blob/4fd0a9af158b69fa3bab5861ce13c552203845d9/logo.svg" alt="safeFetch logo" width="150"/>
</h1>

<p align="center">
    <strong>The production-ready, typed HTTP client for modern TypeScript apps.</strong><br />
      A lightweight, zero-dependency wrapper around <code>fetch</code> with built-in retries, timeouts, interceptors, and strong typing.
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

Native `fetch` is great, but it lacks features needed for real-world apps. **safeFetch** solves this without the bloat of Axios.

- ✨ **Smart & Typed:** Generics support `<T>` for return types.
- 🔄 **Auto-Retries:** Automatically retries on network errors or 5xx responses.
- ⏱️ **Timeouts:** Native timeout support that plays nice with manual cancellation.
- 🛑 **AbortAll:** Cancel all pending requests at once (perfect for React `useEffect` cleanup).
- 🪝 **Interceptors:** Hooks for `onRequest`, `onResponse`, and `onResponseError` (great for token refresh).
- 🔍 **Debug Mode:** Generates copy-pasteable **cURL** commands when requests fail.
- 🍬 **Sugar Syntax:** `.get()`, `.post()`, `.put()`, `.delete()`, `.patch()`.

## 📦 Installation

```bash
npm install @alexfalconflores/safe-fetch
# or
bun add @alexfalconflores/safe-fetch
```

## 💻 Usage

### 1. Quick Start (Singleton)

Use the default instance for quick requests.

```ts
import safeFetch from "@alexfalconflores/safe-fetch";

interface User {
  id: number;
  name: string;
}

// Automatic JSON parsing + Typing
const users = await safeFetch.get<User[]>("/api/users");

// Automatic Body serialization
await safeFetch.post("/api/users", { name: "Alex" });
```

### 2. The Factory Pattern (Recommended)

Create isolated instances for different APIs (e.g., Backend, ThirdParty).

```ts
import { createSafeFetch } from "@alexfalconflores/safe-fetch";

const api = createSafeFetch({
  baseUrl: "[https://api.myapp.com/v1](https://api.myapp.com/v1)",
  headers: {
    "Authorization": "Bearer initial-token",
    "Content-Type": "application/json" // Default
  },
  debug: true, // Prints cURL on error
});

// Usage
const data = await api.get<MyData>("/dashboard");
```

### 3. Advanced Features

🔄 Retries & Timeouts

Configure per-request or globally.

```ts
const data = await api.get("/flaky-endpoint", {
  timeout: 5000,     // Abort after 5s
  retries: 3,        // Retry 3 times on 5xx or Network Error
  retryDelay: 1000,  // Wait 1s between retries
});
```

🪝 Interceptors (Middleware)

Powerful hooks for authentication, logging, or error recovery.

```ts
const api = createSafeFetch({
  // 1. Inject Token before request
  onRequest: async (url, config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  },

  // 2. Global Error Handling
  onError: (err) => console.error("Network died:", err),

  // 3. Auto-Recovery (e.g., Refresh Token on 401)
  onResponseError: async (response, attempt) => {
    if (response.status === 401 && attempt === 0) {
      await refreshToken(); // Your logic
      // Retry the request transparently
      return api.request(response.url, { ...response }); 
    }
  }
});
```

🛑 Cancellation (Abort All)

Stop all pending requests when a component unmounts.

```ts
// React Example
useEffect(() => {
  api.get("/heavy-data").then(setData);

  return () => {
    api.abortAll(); // Cancels pending requests immediately
  };
}, []);
```

🔍 Query Params

Forget about URLSearchParams. Pass a simple object.

```ts
// GET /search?q=books&page=1&tags=a&tags=b
await api.get("/search", {
  params: {
    q: "books",
    page: 1,
    tags: ["a", "b"]
  }
});
```

📦 API Reference

`safeFetch` and `createSafeFetch` accept a configuration object:

|Opción         |Tipo       |Valor por defecto|Descripción                                 |
|---------------|-----------|-----------------|--------------------------------------------|
|baseUrl        |string     |`""`             |Base URL que se antepone a rutas relativas. |
|headers        |HeadersType|`{}`             |Headers globales combinados en cada request.|
|debug          |boolean    |`false`          |Registra comandos cURL cuando hay error.    |
|onRequest      |function   |`undefined`      |Hook previo para modificar la configuración.|
|onResponse     |function   |`undefined`      |Hook posterior para logging/analytics.      |
|onResponseError|function   |`undefined`      |Hook de recuperación para errores 4xx/5xx.  |

Request Options (RequestInitExt)
Extends standard RequestInit with:

- body: Accepts object (auto-stringified), FormData, Blob, etc.
- params: Object for query string generation.
- timeout: Number in ms.
- retries: Number of retry attempts.
- responseType: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'response'.

🛠️ Utilities
Join(...parts)
Helper to join path segments or strings safely.

```ts
import { Join } from "@alexfalconflores/safe-fetch";
Join("-", "2025", "04", "19"); // "2025-04-19"
```

## 🧩 Compatibility

Works in all modern runtimes:

- ✅ Browser (Chrome, Firefox, Safari, Edge)
- ✅ Node.js (v18+ or with polyfill)
- ✅ Bun
- ✅ Deno

## 👤 Autor

Alex Stefano Falcon Flores

- 🐙 GitHub: [alexstefano](https://github.com/alexfalconflores)
- 💼 LinkedIn: [alexsfalconflores](https://www.linkedin.com/in/alexfalconflores/)

## 📄 License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more details.

<p align="center">
⭐ <strong>Love it?</strong> Give it a star on GitHub! 
Built with ❤️ in Peru 🇵🇪
</p>

Give the repo a star to support the project!
And if you use it in your projects, I'd love to see it! 🎉
