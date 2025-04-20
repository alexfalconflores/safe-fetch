export async function safeFetch(
  url: string,
  init?: RequestInitExt,
): Promise<Response> {
  const { method = "GET", headers, body, ...props } = init || {};
  const contentTypeJson: ContentType = "application/json";
  let newBody = body;
  if (
    body &&
    typeof body === "object" &&
    headers?.["Content-Type"] === contentTypeJson
  ) {
    newBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    headers: toHeaders({
      ...headers,
    }),
    body: newBody,
    ...props,
  });
  return response;
}

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

const toHeaders = (headers: HeadersType | Headers): Headers => {
  if (headers instanceof Headers) return headers;
  return new Headers(
    Object.entries(headers).reduce<[string, string][]>((acc, [key, value]) => {
      if (value !== undefined) {
        acc.push([key, String(value)]);
      }
      return acc;
    }, []),
  );
};

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT"
  | (string & {});

export type ContentType =
  | "application/json"
  | "application/xml"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "text/plain"
  | "text/html"
  | "text/css"
  | "text/javascript"
  | "text/xml"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "audio/mpeg"
  | "audio/wav"
  | "video/mp4"
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/octet-stream"
  | "application/javascript"
  | "application/graphql"
  | "application/yaml"
  | "application/zip"
  | (string & {});

export type AuthorizationType =
  | `Bearer ${string}` // OAuth 2.0, JWT
  | `Basic ${string}` // Usuario:Contraseña en base64
  | `Digest ${string}` // Digest Auth con hash
  | `ApiKey ${string}` // Clave de API
  | `OAuth oauth_consumer_key="${string}", oauth_token="${string}", oauth_signature="${string}"` // OAuth 1.0
  | `Hawk id="${string}", ts="${string}", nonce="${string}", mac="${string}"` // Hawk Auth
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
  | `${string}/${string}`; // Permite valores personalizados

export type AcceptEncodingType =
  | "gzip"
  | "compress"
  | "deflate"
  | "br" // Brotli, usado en HTTP/2
  | "identity" // Sin compresión
  | "*" // Aceptar cualquier codificación
  | `${string}`; // Permite valores personalizados

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
  | `${string}`; // Permite valores personalizados como "pt-BR", "ar-SA", etc.

export type CacheControlType =
  | "no-cache" // Siempre debe validar en el servidor antes de usar la caché
  | "no-store" // No almacenar en caché ni en el cliente ni en el servidor
  | "must-revalidate" // Debe validar en el servidor antes de usar la caché
  | "public" // Puede ser almacenado en cualquier caché intermedia
  | "private" // Solo puede ser almacenado en la caché del cliente
  | "max-age=0" // La respuesta es inmediatamente obsoleta
  | `max-age=${number}` // Se puede usar hasta cierto número de segundos
  | `s-maxage=${number}` // Similar a `max-age`, pero solo para cachés compartidas (CDN)
  | "proxy-revalidate" // Similar a `must-revalidate`, pero para proxies
  | "immutable" // Indica que la respuesta nunca cambiará (ideal para archivos estáticos)
  | "stale-while-revalidate" // Permite servir una respuesta caducada mientras se obtiene una nueva en segundo plano
  | "stale-if-error" // Permite servir una respuesta caducada si hay un error en la solicitud
  | `${string}`; // Permite valores personalizados.

export type ContentEncodingType =
  | "gzip"
  | "compress"
  | "deflate"
  | "br"
  | "identity"
  | "zstd"
  | `${string}`; // Nuevo estándar para compresión

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
  | string; // Permite otros idiomas personalizados

export type ETagType =
  | `W/"${string}"` // Weak ETag (ejemplo: W/"123456")
  | `"${string}"` // Strong ETag (ejemplo: "abcdef")
  | string; // Permitir otros valores dinámicos

export type HostType =
  | `${string}.${string}`
  | `${string}.${string}:${number}`
  | string;

export type OriginType =
  | `${"http" | "https"}://${string}.${string}`
  | `${"http" | "https"}://${string}.${string}:${number}`;

export type RefererType = `${"http" | "https"}://${string}`;

export type UserAgentType =
  | `Mozilla/5.0 (${string}) AppleWebKit/${string} (KHTML, like Gecko) ${string}`
  | `curl/${string}`
  | `PostmanRuntime/${string}`
  | `okhttp/${string}`
  | string; // Para permitir valores personalizados

export type AccessControlAllowOriginType = "*" | "null" | `${string}`;

export type AccessControlAllowMethodsType =
  | "*"
  | HttpMethod
  | `${HttpMethod}, ${HttpMethod}`
  | `${HttpMethod}, ${HttpMethod}, ${HttpMethod}`
  | `${HttpMethod}, ${HttpMethod}, ${HttpMethod}, ${HttpMethod}`
  | `${HttpMethod}, ${HttpMethod}, ${HttpMethod}, ${HttpMethod}, ${HttpMethod}`
  | string; // Permite cualquier combinación personalizada

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
