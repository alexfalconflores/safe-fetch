export interface SafeFetchConfig {
  baseUrl?: string;
  headers?: HeadersType;
  /**
   * Hook asíncrono que se ejecuta ANTES de cada petición.
   * Ideal para inyectar tokens o headers dinámicos (cookies, ip, etc).
   */
  onRequest?: (
    url: string,
    init: RequestInitExt,
  ) => Promise<RequestInitExt> | RequestInitExt;
  /**
   * Hook asíncrono que se ejecuta DESPUÉS de recibir la respuesta.
   * Ideal para detectar 401, logging, o errores globales.
   */
  onResponse?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 200 (OK) */
  on200?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 201 (Created) */
  on201?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 202 (Accepted) */
  on202?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 203 (Non-Authoritative Information) */
  on203?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 204 (No Content) */
  on204?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 205 (Reset Content) */
  on205?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 206 (Partial Content) */
  on206?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 207 (Multi-Status) */
  on207?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 208 (Already Reported) */
  on208?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 226 (IM Used) */
  on226?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 300 (Multiple Choices) */
  on300?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 301 (Moved Permanently) */
  on301?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 302 (Found) */
  on302?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 303 (See Other) */
  on303?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 304 (Not Modified) */
  on304?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 307 (Temporary Redirect) */
  on307?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 308 (Permanent Redirect) */
  on308?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 400 (Bad Request) */
  on400?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 401 (Unauthorized) */
  on401?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 402 (Payment Required) */
  on402?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 403 (Forbidden) */
  on403?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 404 (Not Found) */
  on404?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 405 (Method Not Allowed) */
  on405?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve >= 500 (Server Error) */
  on500?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 502 (Bad Gateway) */
  on502?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 503 (Service Unavailable) */
  on503?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 504 (Gateway Timeout) */
  on504?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando el backend devuelve 505 (HTTP Version Not Supported) */
  on505?: (response: Response) => Promise<void> | void;
  /** Se ejecuta cuando fetch falla por red (sin internet, DNS, etc) */
  onError?: (error: unknown) => void;
}

let globalConfig: SafeFetchConfig = {
  baseUrl: "",
  headers: {},
};

export async function safeFetchCore(
  url: string,
  init?: RequestInitExt,
): Promise<Response> {
  const finalUrl = url.startsWith("http")
    ? url
    : `${globalConfig.baseUrl || ""}${url.startsWith("/") ? url : `/${url}`}`;

  let finalInit: RequestInitExt = {
    ...init,
    headers: mergeHeaders(globalConfig.headers, init?.headers),
  };

  if (globalConfig.onRequest) {
    // Le pasamos el control a la config global para que modifique el init
    finalInit = await globalConfig.onRequest(finalUrl, finalInit);
  }

  const { method = "GET", headers, body, ...props } = finalInit || {};
  const contentTypeJson: ContentType = "application/json";
  let newBody = body;

  if (
    body &&
    typeof body === "object" &&
    headers?.["Content-Type"] === contentTypeJson
  ) {
    newBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(finalUrl, {
      method,
      headers: toHeaders(headers || ({} as HeadersType)),
      body: newBody as BodyInit,
      ...props,
    });

    const statusHandlerName = `on${response.status}` as keyof SafeFetchConfig;
    const specificHandler = globalConfig[statusHandlerName];

    if (typeof specificHandler === "function") {
      // TypeScript no sabe si recibe args o no, pero en JS pasar args extra no rompe nada.
      // Casteamos a Function para evitar errores de tipado estricto aquí.
      await (specificHandler as Function)(response);
    }

    if (
      response.status >= 500 &&
      globalConfig.on500 &&
      response.status !== 500
    ) {
      // Evitamos ejecutarlo doble si el status es exactamente 500
      await globalConfig.on500(response);
    }

    if (globalConfig.onResponse) {
      await globalConfig.onResponse(response);
    }

    return response;
  } catch (error) {
    if (globalConfig.onError) {
      globalConfig.onError(error);
    }
    // Re-lanzamos el error para que el componente también se entere si quiere
    throw error;
  }
}

const configure = (config: SafeFetchConfig) => {
  // Fusionamos la config nueva con la existente
  globalConfig = {
    ...globalConfig,
    ...config,
    // Nota: los headers se fusionan, no se reemplazan totalmente
    headers: { ...globalConfig.headers, ...config.headers },
  };
};

export const safeFetch = Object.assign(safeFetchCore, {
  configure, // safeFetch.configure({...})
  // También puedes exponer métodos helpers si quieres
  create: configure, // Alias por si te gusta más 'create'
});

export default safeFetch;

export interface RequestInitExt extends Omit<RequestInit, "headers"> {
  method?: HttpMethod;
  headers?: HeadersType;
}

export function Join(
  separator: string = "",
  ...args: (string | number | (string | number)[])[]
): string {
  return args.flat().join(separator);
}

export const toHeaders = (headers: HeadersType | Headers): Headers => {
  if (headers instanceof Headers) return headers;

  const cleanHeaders: Record<string, string> = {};

  const entries = Object.entries(headers as Record<string, string>);

  for (const [key, value] of entries) {
    if (value != null) {
      cleanHeaders[key] = String(value);
    }
  }

  return new Headers(cleanHeaders);
};

function mergeHeaders(
  global: HeadersType | undefined,
  local: HeadersType | undefined,
): HeadersType {
  return {
    ...((global as Record<string, string>) || {}),
    ...((local as Record<string, string>) || {}),
  };
}

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE"
  | (string & {});

export type ContentType =
  // --- Standard Web & API ---
  | "application/json"
  | "application/xml"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  // --- Modern AI & Streaming (Muy usado ahora con Vercel AI SDK) ---
  | "text/event-stream"
  | "application/x-ndjson" // Newline Delimited JSON
  // --- Documents & Text ---
  | "text/html"
  | "text/plain"
  | "text/css"
  | "text/javascript"
  | "text/xml"
  | "text/markdown" // Útil para CMS
  | "text/csv"
  // --- Files & Media ---
  | "application/pdf"
  | "application/zip"
  | "application/gzip"
  | "application/octet-stream"
  | "application/javascript"
  | "application/graphql"
  | "application/yaml"
  | "application/markdown"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "image/svg+xml"
  | "audio/mpeg"
  | "audio/wav"
  | "video/mp4"
  // --- Microsoft Office ---
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
  | (string & {});

export type AuthorizationType =
  // --- Standards ---
  | `Bearer ${string}` // JWT
  | `Basic ${string}` // base64(user:pass)
  | `Digest ${string}` // Digest Auth con hash
  // --- API Keys (Custom patterns) ---
  | `ApiKey ${string}` // Clave de API
  | `Token ${string}` // Django/Python style
  | `OAuth oauth_consumer_key="${string}", oauth_token="${string}", oauth_signature="${string}"` // OAuth 1.0
  | `Hawk id="${string}", ts="${string}", nonce="${string}", mac="${string}"` // Hawk Auth
  // --- Cloud Signatures ---
  | `AWS4-HMAC-SHA256 Credential=${string}, SignedHeaders=${string}, Signature=${string}` // AWS Signature
  | (string & {});

export type AcceptType =
  | "application/json"
  | "application/xml"
  | "text/html"
  | "text/plain"
  | "text/css"
  | "text/javascript"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "audio/mpeg"
  | "audio/ogg"
  | "video/mp4"
  | "video/webm"
  | "multipart/form-data"
  | "application/x-www-form-urlencoded"
  | "application/pdf"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/vnd.ms-word"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "*/*" // Para aceptar cualquier tipo de contenido
  | (string & {}); // Permite valores personalizados

export type AcceptEncodingType =
  | "gzip"
  | "compress"
  | "deflate"
  | "br" // Brotli, usado en HTTP/2
  | "zstd" // Zstandard (Lo nuevo y ultra rápido)
  | "identity" // Sin compresión
  | "*" // Aceptar cualquier codificación
  | (string & {}); // Permite valores personalizados

export type AcceptLanguageType =
  | "en" // Inglés
  | "en-US"
  | "en-GB"
  | "es" // Español
  | "es-ES"
  | "es-MX"
  | "fr" // Francés
  | "fr-FR"
  | "de" // Alemán
  | "de-DE"
  | "it" // Italiano
  | "it-IT"
  | "ja" // Japonés
  | "ja-JP"
  | "zh" // Chino
  | "zh-CN"
  | "zh-TW"
  | "ru" // Ruso
  | "ru-RU"
  | "*" // Aceptar cualquier idioma
  | (string & {}); // Permite valores personalizados como "pt-BR", "ar-SA", etc.

export type CacheControlType =
  // --- Standard Directives ---
  | "no-cache" // Siempre debe validar en el servidor antes de usar la caché
  | "no-store" // No almacenar en caché ni en el cliente ni en el servidor
  | "must-revalidate" // Debe validar en el servidor antes de usar la caché
  | "public" // Puede ser almacenado en cualquier caché intermedia
  | "private" // Solo puede ser almacenado en la caché del cliente
  | "proxy-revalidate" // Similar a `must-revalidate`, pero para proxies
  | "immutable" // Clave para archivos estáticos (imágenes, fuentes)
  // --- Time Based (Directives with values) ---
  | "max-age=0" // La respuesta es inmediatamente obsoleta
  | `max-age=${number}` // Se puede usar hasta cierto número de segundos
  | `s-maxage=${number}` // Similar a `max-age`, pero solo para cachés compartidas (CDN Cache (Vercel/Cloudflare))
  // --- Modern Revalidation (Next.js ISR) ---
  | `stale-while-revalidate=${number}` // Permite servir una respuesta caducada mientras se obtiene una nueva en segundo plano
  | `stale-if-error=${number}` // Permite servir una respuesta caducada si hay un error en la solicitud
  // --- Combinations (Common patterns) ---
  | "public, max-age=3600, s-maxage=86400"
  | "private, no-cache, no-store, must-revalidate"
  | (string & {}); // Permite valores personalizados.

export type ContentEncodingType =
  | "gzip"
  | "compress"
  | "deflate"
  | "br"
  | "identity"
  | "zstd"
  | (string & {}); // Nuevo estándar para compresión

export type ContentLanguageType =
  | "en" // Inglés
  | "es" // Español
  | "fr" // Francés
  | "de" // Alemán
  | "it" // Italiano
  | "pt" // Portugués
  | "zh" // Chino
  | "ja" // Japonés
  | "ko" // Coreano
  | "ru" // Ruso
  | "ar" // Árabe
  | "hi" // Hindi
  | "nl" // Neerlandés
  | "sv" // Sueco
  | "no" // Noruego
  | "da" // Danés
  | "fi" // Finés
  | "pl" // Polaco
  | "tr" // Turco
  | "cs" // Checo
  | "el" // Griego
  | "he" // Hebreo
  | "vi" // Vietnamita
  | "th" // Tailandés
  | "id" // Indonesio
  | "ms" // Malayo
  | (string & {}); // Permite otros idiomas personalizados

export type ETagType =
  | `W/"${string}"` // Weak ETag (ejemplo: W/"123456")
  | `"${string}"` // Strong ETag (ejemplo: "abcdef")
  | (string & {}); // Permitir otros valores dinámicos

export type HostType =
  | `${string}.${string}`
  | `${string}.${string}:${number}`
  | string
  | (string & {});

export type OriginType =
  | `${"http" | "https"}://${string}.${string}`
  | `${"http" | "https"}://${string}.${string}:${number}`
  | (string & {});

export type RefererType = `${"http" | "https"}://${string}` | (string & {});

export type UserAgentType =
  // --- Navegadores Modernos (Chrome, Edge, Brave, etc.) ---
  | `Mozilla/5.0 (${string}) AppleWebKit/${string} (KHTML, like Gecko) Chrome/${string} Safari/${string}`
  // --- Firefox ---
  | `Mozilla/5.0 (${string}) Gecko/${string} Firefox/${string}`
  // --- Safari ---
  | `Mozilla/5.0 (${string}) AppleWebKit/${string} (KHTML, like Gecko) Version/${string} Safari/${string}`

  // --- Herramientas de Desarrollo (CLIs) ---
  | `curl/${string}`
  | `Wget/${string}`
  | `PostmanRuntime/${string}`
  | `Insomnia/${string}`
  | `httpie/${string}`

  // --- Librerías de Backend (Común en Next.js/Node) ---
  | `node-fetch/${string}`
  | `axios/${string}`
  | `got/${string}`
  | `undici` // El motor de fetch nativo de Node.js 18+
  | `okhttp/${string}` // Apps Android / Java

  // --- Bots / Crawlers (Útil si haces scraping o pre-rendering) ---
  | `Googlebot/${string}`
  | `Bingbot/${string}`
  | `Twitterbot/${string}`
  | `facebookexternalhit/${string}`

  // --- Truco para mantener el autocompletado + permitir custom ---
  | (string & {});

export type AccessControlAllowOriginType = "*" | "null" | `${string}`;

export type AccessControlAllowMethodsType =
  | "*"
  | HttpMethod
  | `${HttpMethod}, ${HttpMethod}`
  | `${HttpMethod}, ${HttpMethod}, ${HttpMethod}`
  | `${HttpMethod}, ${HttpMethod}, ${HttpMethod}, ${HttpMethod}`
  | (string & {}); // Permite cualquier combinación personalizada

export type AccessControlAllowHeadersType = string; // Mantiene la flexibilidad y evita el error

export type HeadersType = {
  "Content-Type"?: ContentType;
  Authorization?: AuthorizationType;
  Accept?: AcceptType; // Tipos de contenido aceptados
  "Accept-Encoding"?: AcceptEncodingType; // Métodos de compresión aceptados (gzip, br)
  "Accept-Language"?: AcceptLanguageType; // Idiomas aceptados (es-ES, en-US)
  "Cache-Control"?: CacheControlType; // Control de caché (no-cache, max-age=3600)
  Connection?: "keep-alive" | "close";
  "Content-Length"?: `${number}`; // Tamaño del cuerpo en bytes
  "Content-Encoding"?: ContentEncodingType; // Método de codificación (gzip, deflate, br)
  "Content-Language"?: ContentLanguageType; // Idioma del contenido (es, en, fr)
  "Content-Disposition"?: string; // Manejo del contenido (attachment; filename="file.pdf")
  ETag?: ETagType; // Identificador único para cacheo de recursos
  Host?: HostType; // Nombre del servidor al que se envía la solicitud
  Origin?: OriginType; // Origen de la solicitud (https://example.com)
  Referer?: RefererType; // URL de referencia
  "User-Agent"?: UserAgentType; // Información del navegador o cliente
  "Access-Control-Allow-Origin"?: AccessControlAllowOriginType; // Permitir acceso desde ciertos dominios (*, https://example.com)
  "Access-Control-Allow-Methods"?: AccessControlAllowMethodsType; // Métodos permitidos (GET, POST, PUT)
  "Access-Control-Allow-Headers"?: AccessControlAllowHeadersType; // Headers permitidos en la solicitud
  "X-Frame-Options"?: "DENY" | "SAMEORIGIN"; // Protección contra Clickjacking
  "X-XSS-Protection"?: "0" | "1; mode=block"; // Protección contra ataques XSS
  "X-Content-Type-Options"?: "nosniff"; // Evita detección automática de MIME
  "Content-Security-Policy"?: string; // Política de seguridad del contenido
  "Strict-Transport-Security"?: string; // Fuerza el uso de HTTPS
  [key: string]: string | undefined;
};
