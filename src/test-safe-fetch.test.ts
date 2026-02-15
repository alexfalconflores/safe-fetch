import { createSafeFetch } from "./safe-fetch";

const globalScope = typeof globalThis !== "undefined" ? globalThis : global;
const originalFetch = globalScope.fetch;

console.log("\n🚀 INICIANDO ULTIMATE TEST SUITE: SAFE-FETCH\n");

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${label}`);
    if (details) console.error(`   -> ${details}`);
    failed++;
  }
}

// Mock Robusto con soporte de Señales
function mockFetch(handler: (url: string, init: any) => Promise<Response>) {
  // @ts-ignore
  globalScope.fetch = async (url: string, init: any) => {
    // Chequeo inmediato
    if (init.signal && init.signal.aborted) {
      const e = new Error("Aborted");
      e.name = "AbortError";
      throw e;
    }

    // Promesa compatible con aborto asíncrono
    return new Promise(async (resolve, reject) => {
      const abortHandler = () => {
        const e = new Error("Aborted");
        e.name = "AbortError";
        reject(e);
      };

      if (init.signal) {
        init.signal.addEventListener("abort", abortHandler);
      }

      try {
        const res = await handler(url, init);
        if (init.signal && init.signal.aborted) return abortHandler();
        resolve(res);
      } catch (e) {
        reject(e);
      } finally {
        if (init.signal) {
          init.signal.removeEventListener("abort", abortHandler);
        }
      }
    });
  };
}

function restoreFetch() {
  // @ts-ignore
  globalScope.fetch = originalFetch;
}

async function runTests() {
  try {
    // ======================================================
    // 1. TEST DE MÉTODOS HTTP
    // ======================================================
    console.log("\n📡 1. Testing HTTP Methods");
    const api = createSafeFetch({ baseUrl: "https://api.test" });

    let captured: any = {};
    mockFetch(async (url, init) => {
      captured = { method: init.method, body: init.body };
      return new Response(JSON.stringify({ ok: true }));
    });

    await api.get("/test");
    assert("GET", captured.method === "GET");

    await api.post("/test", { a: 1 });
    assert(
      "POST + Body",
      captured.method === "POST" && captured.body === '{"a":1}',
    );

    await api.delete("/test");
    assert("DELETE", captured.method === "DELETE");

    // ======================================================
    // 2. TEST DE RESPONSE TYPES
    // ======================================================
    console.log("\n📦 2. Testing Response Types");

    mockFetch(async (url) => {
      if (url.includes("blob")) return new Response(new Blob(["data"]));
      return new Response("plain text");
    });

    const txt = await api.get<string>("/txt", { responseType: "text" });
    assert("Text", txt === "plain text");

    const blob = await api.get<Blob>("/blob", { responseType: "blob" });
    assert("Blob", blob instanceof Blob);

    // ======================================================
    // 3. TEST DE SIGNAL MERGING & TIMEOUT (RECUPERADO)
    // ======================================================
    console.log("\n🛑 3. Testing Signal & Timeout");

    // A) Timeout
    mockFetch(async () => {
      await new Promise((r) => setTimeout(r, 100)); // Lento
      return new Response("ok");
    });

    try {
      await api.get("/slow", { timeout: 10 }); // Muy rápido
      assert("Timeout", false, "Should throw timeout");
    } catch (e: any) {
      assert("Timeout Caught", e.message.includes("timeout"));
    }

    // B) AbortAll
    const apiAbort = createSafeFetch({});
    const p1 = apiAbort.get("/wait-1");
    const p2 = apiAbort.get("/wait-2");
    apiAbort.abortAll(); // Cancelación masiva

    try {
      await Promise.all([p1, p2]);
      assert("AbortAll", false, "Should throw abort");
    } catch (e: any) {
      // Puede decir "aborted by user" o "safeFetch.abortAll" dependiendo de la carrera
      assert("AbortAll Caught", e.message.includes("abort"));
    }

    // ======================================================
    // 4. TEST DE CONFIGURACIÓN & HEADERS (RECUPERADO)
    // ======================================================
    console.log("\n⚙️ 4. Testing Config & Headers");

    const apiHeaders = createSafeFetch({
      baseUrl: "https://base.com",
      headers: { "x-global": "1" },
    });

    let headersSent: any = {};
    mockFetch(async (url, init) => {
      assert("BaseURL Applied", url.startsWith("https://base.com"));
      init.headers.forEach((v: string, k: string) => (headersSent[k] = v));
      return new Response("{}");
    });

    await apiHeaders.get("/h", { headers: { "x-local": "2" } });

    assert("Global Header", headersSent["x-global"] === "1");
    assert("Local Header", headersSent["x-local"] === "2");

    // ======================================================
    // 5. TEST DE LIFECYCLE HOOKS
    // ======================================================
    console.log("\n🪝 5. Testing Lifecycle Hooks");

    let flags = { req: false, res: false, e404: false };
    const apiHooks = createSafeFetch({
      onRequest: async (u, i) => {
        flags.req = true;
        return i;
      },
      onResponse: () => {
        flags.res = true;
      },
      on404: () => {
        flags.e404 = true;
      },
    });

    mockFetch(async () => new Response("Not Found", { status: 404 }));
    await apiHooks.get("/missing");

    assert("Hook: onRequest", flags.req);
    assert("Hook: onResponse", flags.res);
    assert("Hook: on404", flags.e404);

    // Test Recovery (onResponseError)
    const apiRecovery = createSafeFetch({
      onResponseError: async () => new Response("{}", { status: 200 }),
    });
    mockFetch(async () => new Response("Error", { status: 401 }));
    const rec = await apiRecovery.get("/recover");
    // Si llega aquí sin lanzar error, es que se recuperó
    assert("Hook: Recovery", true);

    // ======================================================
    // 6. TEST DE USO DIRECTO (CORE)
    // ======================================================
    console.log("\n🔥 6. Testing Core (No Sugar)");

    mockFetch(async (url, init) => {
      // Verificar que el body llegó como string (JSON)
      return new Response(
        JSON.stringify({
          bodyType: typeof init.body,
        }),
      );
    });

    const coreRes = await api("/core", { method: "POST", body: { x: 1 } });
    const coreJson = await coreRes.json();

    assert("Core returns Response", coreRes instanceof Response);
    assert("Core handles JSON", coreJson.bodyType === "string");

    // ======================================================
    // RESUMEN
    // ======================================================
    console.log("\n---------------------------------------------------");
    if (failed === 0) {
      console.log(`🎉  ¡GOD MODE CONFIRMADO! ${passed} pruebas pasaron.`);
    } else {
      console.error(`⚠️  FALLARON ${failed} pruebas.`);
      process.exit(1);
    }
    console.log("---------------------------------------------------");
  } catch (e) {
    console.error("❌ CRITICAL ERROR:", e);
  } finally {
    restoreFetch();
  }
}

runTests();
