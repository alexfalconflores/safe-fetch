# Changelog

## [1.0.0] - 2025-04-20

### 🛡️ The Journey Begins: safeFetch Rises

- First stable release of `safeFetch`.
- Introduces a safer and more expressive wrapper around the native `fetch` API.
- Full typing for `HeadersType`, `HttpMethod`, `ContentType`, `AuthorizationType`, and other common HTTP headers.
- Support for:
  - Fully Promise-based, designed for async/await flow.
  - Automatic `body` serialization in JSON format if `Content-Type` is `application/json`.
  - `RequestInitExt` extension that overrides the original type `headers` to use a custom, typed one.
- `toHeaders()` function:
  - Converts flat objects to valid `Headers`, ignoring undefined values.
- `Join(separator, ...args)` function:
  - Auxiliary utility to concatenate strings/numbers or arrays of these.
- Types Added
  - `HttpMethod`: Type support for all standard and custom HTTP methods.
  - `ContentType`, `AcceptType`, `AuthorizationType`, `CacheControlType`, `UserAgentType`, among other common headers.
  - `HeadersType`: Extensible object with validations for the most common HTTP request headers.
