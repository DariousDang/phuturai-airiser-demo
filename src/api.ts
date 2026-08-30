import type { Analysis, Answer, ProviderStatus } from "./types";

async function request<T>(path: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "The request failed.");
  return payload;
}

export function analyzeTranscript(transcript: string) {
  return request<Analysis>("/api/analyze", { transcript });
}

export function askTranscript(transcript: string, question: string) {
  return request<Answer>("/api/ask", { transcript, question });
}

export async function getProviderStatus(): Promise<ProviderStatus> {
  const response = await fetch("/api/status", { cache: "no-store" });
  const payload = (await response.json()) as ProviderStatus & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Provider status failed.");
  return payload;
}
