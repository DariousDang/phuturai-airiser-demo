import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { handleApiRequest } from "./api.mjs";

const transcript = [
  "Thanh: We will launch the Atlas pilot on September 15.",
  "Mai: I will finish the onboarding guide by Friday.",
  "Linh: Six teams have confirmed participation.",
  "Thanh: The pilot budget is capped at $1,200.",
  "Mai: Customer transcripts must stay on the user's machine.",
  "Linh: I own the privacy review by September 7.",
  "Thanh: The remaining teams have not confirmed yet.",
  "Linh: Do not launch until the privacy review passes.",
].join("\n");

async function invoke({ method = "GET", url = "/api/status", body, environment = {} } = {}) {
  const request = Readable.from(body === undefined ? [] : [JSON.stringify(body)]);
  request.method = method;
  request.url = url;

  let status;
  let payload = "";
  const response = {
    writeHead(code) {
      status = code;
    },
    end(chunk = "") {
      payload += chunk;
    },
  };

  const handled = await handleApiRequest(request, response, environment);
  return { handled, status, body: JSON.parse(payload) };
}

test("reports transparent rehearsal status", async () => {
  const result = await invoke({ environment: { DEMO_MODE: "true" } });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    provider: "demo",
    model: "gemma4:12b",
    ready: true,
    privacy: "rehearsal",
  });
});

test("automatically selects hosted Gemini when AI Studio injects its server secret", async () => {
  const result = await invoke({ environment: { GEMINI_API_KEY: "test-server-secret" } });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    provider: "gemini",
    model: "gemini-3.7-flash",
    ready: true,
    privacy: "hosted",
  });
});

test("an explicit local provider still wins when a Gemini key is also present", async () => {
  const result = await invoke({
    environment: {
      AI_PROVIDER: "ollama",
      GEMINI_API_KEY: "test-server-secret",
      OLLAMA_BASE_URL: "http://127.0.0.1:1",
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.provider, "ollama");
  assert.equal(result.body.ready, false);
  assert.equal(result.body.privacy, "local");
});

test("hydrates model citations from exact transcript lines", async () => {
  const result = await invoke({
    method: "POST",
    url: "/api/analyze",
    body: { transcript },
    environment: { DEMO_MODE: "true" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.meta.mode, "demo");
  assert.equal(result.body.decisions[1].evidence.lineStart, 8);
  assert.equal(
    result.body.decisions[1].evidence.quote,
    "Linh: Do not launch until the privacy review passes.",
  );
});

test("returns a grounded refusal for absent information", async () => {
  const result = await invoke({
    method: "POST",
    url: "/api/ask",
    body: { transcript, question: "What is the office address?" },
    environment: { DEMO_MODE: "true" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.answer, "Not found in transcript.");
  assert.equal(result.body.confidence, "not_found");
  assert.deepEqual(result.body.citations, []);
});

test("rejects short transcripts before inference", async () => {
  const result = await invoke({
    method: "POST",
    url: "/api/analyze",
    body: { transcript: "Too short" },
    environment: { DEMO_MODE: "true" },
  });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /at least 40 characters/);
});

test("returns 404 for an unknown API route", async () => {
  const result = await invoke({
    method: "POST",
    url: "/api/missing",
    body: { transcript },
    environment: { DEMO_MODE: "true" },
  });
  assert.equal(result.status, 404);
  assert.equal(result.body.error, "API route not found.");
});

test("reports a configured local model as offline without leaking data", async () => {
  const result = await invoke({
    environment: {
      AI_PROVIDER: "ollama",
      OLLAMA_BASE_URL: "http://127.0.0.1:1",
      OLLAMA_MODEL: "gemma4:12b",
    },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    provider: "ollama",
    model: "gemma4:12b",
    ready: false,
    privacy: "local",
  });
});
