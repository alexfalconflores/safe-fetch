<h1 align="center">
    safeFetch
  <br />
  <img src="https://github.com/alexfalconflores/safe-fetch/blob/4fd0a9af158b69fa3bab5861ce13c552203845d9/logo.svg" alt="safeFetch logo" width="150"/>
</h1>

<p align="center">
  <strong><code>safeFetch</code> is a typed enhancement to the JavaScript <code>fetch</code> method.</strong><br />
  This function is designed to facilitate the sending of HTTP requests with greater security and typed control over headers, including automatic handling of the body if <code>Content-Type: application/json</code> is specified.
</p>

---

## 🚀 Installation

```bash
npm install @alexfalconflores/safe-fetch
```

✨ Features

- Auto-conversion from body to JSON if Content-Type: application/json is specified
- Strong typing for HTTP methods, headers and common network values
- Accepts extended and custom headers
- Supports standard fetch (can completely replace it)

## 📦 Examples of use

### ⚙️ Basic Example

```ts
import safeFetch from "@alexfalconflores/safe-fetch";

const response = await safeFetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer abc123",
  },
  body: { name: "Alex", email: "alex@correo.com" },
});

const data = await response.json();
```

### ⚙️ Advanced Example

```ts
import safeFetch from "@alexfalconflores/safe-fetch";

const response = await safeFetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer 123token",
    "Cache-Control": "no-cache",
  },
  body: { name: "Alex", email: "alex@correo.com" },
});

const data = await response.json();
```

## 📦 API

`safeFetch(url: string, init?: RequestInitExt): Promise<Response>`

- `url`: Destination URL of the request.
- `init`: Optional object extending RequestInit, with typed headers.

## 🧩 Extended typing

- `RequestInitExt`

```ts
interface RequestInitExt extends Omit<RequestInit, "headers"> {
  method?: HttpMethod;
  headers?: HeadersType;
}
```

- `HttpMethod`

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | ...;
```

- `HeadersType`

```ts
{
  "Content-Type"?: ContentType;
  Authorization?: AuthorizationType;
  Accept?: AcceptType;
  ...
}
```

Extendable types are included for:

- `AuthorizationType` (Bearer, Basic, ApiKey, etc.)
- `ContentType` (application/json, text/html, etc.)
- `AcceptType`
- `CacheControlType`
- `AcceptLanguageType`
- `UserAgentType`, y muchos más.

## 🛠️ Auxiliary function: `Join`
```ts
Join("-", "2025", "04", "19"); // "2025-04-19"
```

## 🧩 Compatibility
Compatible with environments where fetch is available: modern browsers, Deno and Node.js (v18+ or with polyfill).

## 👤 Autor

Alex Stefano Falcon Flores

- 🐙 GitHub: [alexstefano](https://github.com/alexfalconflores)
- 💼 LinkedIn: [alexsfalconflores](https://www.linkedin.com/in/alexfalconflores/)

## 📄 License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more details.

## ⭐ Do you like it?

Give the repo a star to support the project!
And if you use it in your projects, I'd love to see it! 🎉
