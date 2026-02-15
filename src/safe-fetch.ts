/**
 * ⚙️ **Configuración Global de SafeFetch**
 * Define el comportamiento base, interceptores y manejo de errores
 * para todas las peticiones realizadas con esta instancia.
 */
export interface SafeFetchConfig {
  /**
   * URL base que se prefijará a todas las peticiones relativas.
   * @example "https://api.mi-backend.com/v1"
   */
  baseUrl?: string;
  /** Headers globales que se enviarán en cada petición (ej: API Keys publicas). */
  headers?: HeadersType;
  /** 🐞 Si es true, imprime logs y comandos cURL en la consola al fallar. */
  debug?: boolean;
  /**
   * ⚡ **Interceptor de Solicitud (Pre-Request)**
   * Hook asíncrono que se ejecuta ANTES de que la petición salga.
   *
   * Úsalo para:
   * - Inyectar Tokens de Autenticación (Bearer).
   * - Agregar headers dinámicos (Timestamp, Fingerprint).
   * - Modificar la URL al vuelo.
   *
   * @example
   * onRequest: async (url, config) => {
   * const token = await getToken();
   * config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
   * return config;
   * }
   */
  onRequest?: (
    url: string,
    init: RequestInitExt,
  ) => Promise<RequestInitExt> | RequestInitExt;
  /**
   * ⚡ **Interceptor de Respuesta (Post-Response)**
   * Hook asíncrono que se ejecuta DESPUÉS de recibir la respuesta,
   * independientemente del status code (siempre que no sea error de red).
   * Útil para logging global.
   */
  onResponse?: (response: Response) => Promise<void> | void;
  /** * Permite interceptar errores de respuesta (ej: 401) para intentar corregirlos.
   * Si devuelve una Response, se usa esa y no se lanza error.
   */
  onResponseError?: (
    response: Response,
    attempt: number,
  ) => Promise<Response | void>;
  // --- Status Handlers (2xx) ---
  /** Ejecutado cuando el backend devuelve 200 (OK). */
  on200?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 201 (Created). Ideal para notificaciones "Guardado con éxito". */
  on201?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 202 (Accepted). */
  on202?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 203 (Non-Authoritative Info). */
  on203?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 204 (No Content). */
  on204?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 205 (Reset Content). */
  on205?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 206 (Partial Content). */
  on206?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 207 (Multi-Status). */
  on207?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 208 (Already Reported). */
  on208?: (response: Response) => Promise<void> | void;
  /** Ejecutado cuando el backend devuelve 226 (IM Used). */
  on226?: (response: Response) => Promise<void> | void;

  // --- Redirection Handlers (3xx) ---
  /** Ejecutado en 300 (Multiple Choices). */
  on300?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 301 (Moved Permanently). */
  on301?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 302 (Found). */
  on302?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 303 (See Other). */
  on303?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 304 (Not Modified). Útil para manejo de caché local. */
  on304?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 307 (Temporary Redirect). */
  on307?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 308 (Permanent Redirect). */
  on308?: (response: Response) => Promise<void> | void;

  // --- Client Error Handlers (4xx) ---
  /** Ejecutado en 400 (Bad Request). Ideal para mostrar errores de validación. */
  on400?: (response: Response) => Promise<void> | void;
  /**
   * 🔒 **Unauthorized Handler (401)**
   * Crítico para manejar sesiones expiradas.
   * @example
   * on401: () => { router.push('/login'); }
   */
  on401?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 402 (Payment Required). */
  on402?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 403 (Forbidden). El usuario no tiene permisos. */
  on403?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 404 (Not Found). */
  on404?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 405 (Method Not Allowed). */
  on405?: (response: Response) => Promise<void> | void;
  // --- Server Error Handlers (5xx) ---
  /**
   * 🚨 **Global Server Error (>= 500)**
   * Se ejecuta para cualquier error 500+ (incluyendo 502, 503, etc).
   * Útil para reportar errores críticos a servicios como Sentry.
   */
  on500?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 502 (Bad Gateway). */
  on502?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 503 (Service Unavailable). Mantenimiento o sobrecarga. */
  on503?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 504 (Gateway Timeout). */
  on504?: (response: Response) => Promise<void> | void;
  /** Ejecutado en 505 (HTTP Version Not Supported). */
  on505?: (response: Response) => Promise<void> | void;

  /**
   * 💥 **Network Error Handler**
   * Se ejecuta cuando `fetch` falla a nivel de red (Sin internet, DNS fallido, CORS bloqueado).
   * NO se ejecuta en errores 4xx o 5xx (eso son respuestas válidas del servidor).
   */
  onError?: (error: unknown) => void;
}

/** Extensión de RequestInit para soportar tipado fuerte de métodos y headers */
export interface RequestInitExt extends Omit<RequestInit, "headers" | "body"> {
  method?: HttpMethod;
  headers?: HeadersType;
  body?: BodyInit | Record<string, any> | any[] | null;
  /**
   * ⏱️ Tiempo máximo de espera en milisegundos.
   * Si la petición tarda más, se abortará y lanzará un error.
   * @example 5000 (5 segundos)
   */
  timeout?: number;
  /** 🔄 Número de reintentos en caso de fallo (Red o 5xx). Default: 0 */
  retries?: number;
  /** ⏳ Tiempo de espera entre reintentos (ms). Default: 1000 */
  retryDelay?: number;
  /** * 📦 Tipo de respuesta esperada.
   * - "json" (Default): Intenta parsear JSON.
   * - "blob": Para archivos, imágenes, PDFs.
   * - "text": Para HTML, CSV, XML.
   * - "arrayBuffer": Para manipulación binaria raw.
   * - "response": Devuelve el objeto Response nativo sin procesar.
   */
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "response";
  /** * 🔍 Objeto de Query Params.
   * Se convertirán automáticamente a string (ej: ?page=1&sort=asc)
   */
  params?: Record<
    string,
    string | number | boolean | (string | number | boolean)[] | undefined | null
  >;
}

/**
 * 🏭 **Factory Function: createSafeFetch**
 * * Crea una instancia aislada de `safeFetch` con su propia configuración.
 * Ideal para manejar múltiples APIs con diferentes `baseUrl` o `headers`.
 * * @param defaultConfig Configuración inicial (base URL, headers, debug, etc).
 * @returns Una instancia de safeFetch con métodos HTTP (get, post...) y control de ciclo de vida.
 * * @example
 * const api = createSafeFetch({ baseUrl: "https://api.example.com", headers: { "X-Auth": "123" } });
 * const users = await api.get("/users");
 */
export function createSafeFetch(defaultConfig: SafeFetchConfig = {}) {
  const activeControllers = new Set<AbortController>();

  let localConfig: SafeFetchConfig = {
    baseUrl: "",
    headers: {},
    debug: false,
    ...defaultConfig,
  };

  /**
   * Actualiza la configuración de la instancia actual.
   * Fusiona los valores nuevos con los existentes.
   * @param config Nueva configuración parcial.
   */
  const configure = (config: SafeFetchConfig) => {
    localConfig = {
      ...localConfig,
      ...config,
      headers: { ...localConfig.headers, ...config.headers },
    };
  };

  /**
   * 🧠 **Núcleo de SafeFetch**
   * * Ejecuta la petición HTTP con toda la lógica de seguridad:
   * - Retries (Reintentos automáticos)
   * - Timeouts seguros
   * - Cancelación masiva (AbortAll)
   * - Interceptores (onRequest, onResponse)
   * - Manejo de errores unificado
   * * @param url Ruta relativa o absoluta.
   * @param init Opciones de la petición.
   * @returns Promesa con la respuesta `Response` nativa (sin parsear).
   */
  const core = async (
    url: string,
    init?: RequestInitExt,
  ): Promise<Response> => {
    let finalUrl = url.startsWith("http")
      ? url
      : `${localConfig.baseUrl || ""}${url.startsWith("/") ? url : `/${url}`}`;

    let urlWithParams = finalUrl;
    if (init?.params) {
      const urlObj = new URL(
        finalUrl.startsWith("http") ? finalUrl : `http://dummy${finalUrl}`,
      );
      Object.entries(init.params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => urlObj.searchParams.append(key, String(v)));
        } else {
          urlObj.searchParams.append(key, String(value));
        }
      });
      urlWithParams = finalUrl.startsWith("http")
        ? urlObj.href
        : urlObj.pathname + urlObj.search;
    }

    const requestController = new AbortController();
    activeControllers.add(requestController);

    let finalInit: RequestInitExt = {
      ...init,
      headers: mergeHeaders(localConfig.headers, init?.headers),
    };

    if (localConfig.onRequest) {
      finalInit = await localConfig.onRequest(urlWithParams, finalInit);
    }

    const {
      method = "GET",
      headers,
      body,
      timeout,
      retries = 0,
      retryDelay = 1000,
      params,
      responseType,
      signal: userSignal,
      ...props
    } = finalInit || {};

    let newBody = body;
    const finalHeaders = headers || ({} as HeadersType);
    const contentTypeJson: ContentType = "application/json";

    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
    const isBuffer =
      typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
    const isSearchParams =
      typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
    const isReadableStream =
      typeof ReadableStream !== "undefined" && body instanceof ReadableStream;

    if (isFormData) {
      if (finalHeaders["Content-Type"]) {
        delete finalHeaders["Content-Type"];
      }
    } else if (isBlob || isBuffer || isSearchParams || isReadableStream) {
      // native handling
    } else {
      if (
        body &&
        typeof body === "object" &&
        // Si no se especificó content-type, o si es explicitamente json
        (!finalHeaders["Content-Type"] ||
          finalHeaders["Content-Type"] === contentTypeJson)
      ) {
        newBody = JSON.stringify(body);

        // Aseguramos el header si no estaba
        if (!finalHeaders["Content-Type"]) {
          finalHeaders["Content-Type"] = contentTypeJson;
        }
      }
    }

    let lastError: any;
    let response: Response | undefined;

    try {
      for (let attempt = 0; attempt <= retries; attempt++) {
        let timeoutController: AbortController | undefined;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        try {
          const signalsToMerge: (AbortSignal | undefined | null)[] = [
            userSignal, // 1. Usuario
            requestController.signal, // 2. Cancelación Masiva (abortAll)
          ];

          if (timeout) {
            timeoutController = new AbortController();
            timeoutId = setTimeout(() => timeoutController?.abort(), timeout);
            signalsToMerge.push(timeoutController.signal);
          }

          const effectiveSignal = mergeSignals(...signalsToMerge);

          if (localConfig.debug && attempt === 0) {
            console.log(`🚀 [SafeFetch] ${method} ${urlWithParams}`);
          }

          response = await fetch(urlWithParams, {
            method,
            headers: toHeaders(headers || ({} as HeadersType)),
            body: newBody as BodyInit,
            signal: effectiveSignal,
            ...props,
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (response.status < 500) {
            if (!response.ok && localConfig.onResponseError) {
              const recoveredResponse = await localConfig.onResponseError(
                response,
                attempt,
              );
              if (recoveredResponse instanceof Response) {
                response = recoveredResponse;
              }
            }
            break;
          } else {
            if (attempt < retries) {
              throw new Error(`Server Error ${response.status}`);
            }
          }
        } catch (error: any) {
          lastError = error;
          if (timeoutId) clearTimeout(timeoutId);

          if (error.name === "AbortError") {
            // Lógica de diagnóstico de error
            if (timeout && timeoutController?.signal.aborted) {
              lastError = new Error(`Request timeout after ${timeout}ms`);
            } else if (userSignal?.aborted) {
              lastError = new Error("Request aborted by user");
            } else if (requestController.signal.aborted) {
              lastError = new Error("Request aborted by safeFetch.abortAll()");
            } else {
              lastError = error;
            }
          }

          if (localConfig.debug) {
            console.warn(
              `⚠️ [Attempt ${attempt + 1}/${retries + 1}] Failed: ${lastError.message}`,
            );
          }

          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        }
        break;
      }

      if (!response) {
        if (localConfig.debug) {
          console.error("❌ [SafeFetch] Request Failed Definitively.");
          console.error("📋 Copy this cURL to debug:");
          console.log(
            generateCurl({
              url: urlWithParams,
              method,
              headers: finalHeaders,
              body: newBody,
            }),
          );
        }

        if (localConfig.onError) localConfig.onError(lastError);
        throw lastError; // Lanzamos el último error capturado
      }

      // Handlers execution...
      const statusHandlerName = `on${response.status}` as keyof SafeFetchConfig;
      const specificHandler = localConfig[statusHandlerName];

      if (typeof specificHandler === "function") {
        await (specificHandler as Function)(response);
      }

      if (
        response.status >= 500 &&
        localConfig.on500 &&
        response.status !== 500
      ) {
        await localConfig.on500(response);
      }

      if (localConfig.onResponse) {
        await localConfig.onResponse(response);
      }

      return response;
    } finally {
      activeControllers.delete(requestController);
    }
  };

  /**
   * Helper genérico para realizar peticiones y parsear la respuesta automáticamente.
   * @template T Tipo de dato esperado en la respuesta.
   */
  const request = async <T>(url: string, init: RequestInitExt): Promise<T> => {
    const response = await core(url, init);
    const type = init?.responseType || "json";

    if (type === "response") return response as unknown as T;
    if (type === "blob") return (await response.blob()) as unknown as T;
    if (type === "arrayBuffer")
      return (await response.arrayBuffer()) as unknown as T;
    if (type === "text") return (await response.text()) as unknown as T;

    // 204 No Content -> Retornamos objeto vacío o null
    if (response.status === 204) return {} as T;

    const text = await response.text();

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  };

  const httpMethods = {
    /** Realiza una petición GET */
    get: <T>(url: string, init?: RequestInitExt) =>
      request<T>(url, { ...init, method: "GET" }),
    /** Realiza una petición POST enviando datos JSON */
    post: <T>(url: string, body?: any, init?: RequestInitExt) =>
      request<T>(url, {
        ...init,
        method: "POST",
        body,
        headers: { "Content-Type": "application/json", ...init?.headers },
      }),
    /** Realiza una petición PUT */
    put: <T>(url: string, body?: any, init?: RequestInitExt) =>
      request<T>(url, {
        ...init,
        method: "PUT",
        body,
        headers: { "Content-Type": "application/json", ...init?.headers },
      }),
    /** Realiza una petición PATCH */
    patch: <T>(url: string, body?: any, init?: RequestInitExt) =>
      request<T>(url, {
        ...init,
        method: "PATCH",
        body,
        headers: { "Content-Type": "application/json", ...init?.headers },
      }),
    /** Realiza una petición DELETE */
    delete: <T>(url: string, init?: RequestInitExt) =>
      request<T>(url, { ...init, method: "DELETE" }),
  };

  /**
   * 🛑 **Abort All**
   * Cancela TODAS las peticiones activas iniciadas por esta instancia.
   * Útil para limpieza en `useEffect` o al cambiar de página.
   */
  const abortAll = () => {
    activeControllers.forEach((c) => c.abort());
    activeControllers.clear();
  };

  return Object.assign(core, {
    configure,
    create: configure, // Alias por si prefieres 'create' para configurar
    abortAll,
    ...httpMethods,
  });
}

/**
 * Instancia por defecto de SafeFetch lista para usar.
 */
export const safeFetch = createSafeFetch();
export default safeFetch;

/**
 * Fusiona dos AbortSignals. Si cualquiera de los dos aborta, el resultado aborta.
 */
function mergeSignals(
  ...signals: (AbortSignal | undefined | null)[]
): AbortSignal | undefined {
  // Filtramos los nulos/undefined
  const activeSignals = signals.filter((s) => s) as AbortSignal[];

  if (activeSignals.length === 0) return undefined;
  if (activeSignals.length === 1) return activeSignals[0];

  // 1. Soporte Nativo (Node 20+, Chrome 116+, Bun)
  if ("any" in AbortSignal && typeof AbortSignal.any === "function") {
    // @ts-ignore
    return AbortSignal.any(activeSignals);
  }
  const cleanup = () => {
    for (const sig of activeSignals) {
      sig.removeEventListener("abort", onAbort);
    }
  };

  // 2. Polyfill Robusto
  const controller = new AbortController();

  // Si alguno ya está abortado, abortamos inmediatamente
  for (const sig of activeSignals) {
    if (sig.aborted) {
      controller.abort(sig.reason);
      return controller.signal;
    }
  }

  const onAbort = (evt: Event) => {
    controller.abort((evt.target as AbortSignal).reason);
    cleanup();
  };

  // Suscribirse
  for (const sig of activeSignals) {
    sig.addEventListener("abort", onAbort, { once: true });
  }

  return controller.signal;
}

/**
 * Genera un comando cURL para debugging fácil.
 */
function generateCurl(req: {
  url: string;
  method: string;
  headers: HeadersType;
  body: any;
}) {
  let curl = `curl -X ${req.method} '${req.url}'`;

  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (value) curl += ` \\\n  -H '${key}: ${value}'`;
  });

  if (req.body) {
    // Solo agregamos body si es string (JSON)
    // FormData es muy complejo de representar en curl simple
    if (typeof req.body === "string") {
      curl += ` \\\n  -d '${req.body.replace(/'/g, "'\\''")}'`;
    } else {
      curl += ` \\\n  --data '[Complex Body]'`;
    }
  }
  return curl;
}

/**
 * Utilidad para unir cadenas o arrays (útil para clases CSS o Paths).
 */
export function Join(
  separator: string = "",
  ...args: (string | number | (string | number)[])[]
): string {
  return args.flat().join(separator);
}

/** Convierte el objeto de headers tipado a Headers nativos */
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
// ============================================================================
// 📦 TIPADO ESTRICTO DE HTTP
// ============================================================================
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

/** Tipado exhaustivo de Content-Types comunes para autocompletado */
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

/** Patrones de autorización comunes */
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

/**
 * 🧱 **Headers Tipados**
 * Provee autocompletado para todos los headers HTTP estándar,
 * pero permite strings arbitrarios para headers personalizados.
 */
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
