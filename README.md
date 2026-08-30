# Phuturai: AI Riser Vietnam demo

Phuturai is a private AI memory that turns a meeting transcript into a cited brief, explicit decisions, assigned actions, key facts, risks, and grounded answers. Its primary mode runs Google's open Gemma model locally through Ollama. Model-proposed citations are replaced with exact transcript lines before evidence reaches the interface.

## Run locally with Gemma

Start Ollama with Intel Vulkan acceleration:

```powershell
$env:OLLAMA_VULKAN="1"
ollama serve
```

In another PowerShell window:

```powershell
ollama pull gemma4:12b
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:4173`. The default configuration uses `AI_PROVIDER=ollama`, so transcript content is sent only to the Ollama service at `127.0.0.1`.

Verified on an Intel Arc B580 12 GB: Gemma 4 12B loaded fully on the GPU, produced
the sample knowledge brief in about 28 seconds, and answered a warm grounded
question in about 3 seconds. Expect the first request after startup to include a
roughly 13-second model load.

## Provider modes

- `AI_PROVIDER=ollama`: primary product mode. Local Gemma, no cloud inference.
- `AI_PROVIDER=gemini`: hosted competition preview. Requires `GEMINI_API_KEY`.
  In AI Studio, the provider is selected automatically when its server-side
  `GEMINI_API_KEY` secret is present and `AI_PROVIDER` is not explicitly set.
- `DEMO_MODE=true`: transparent fixed rehearsal data without model inference.

The interface labels each mode so the hosted preview is never presented as the local product.

## Google AI Studio submission

An AI Studio shared app cannot access Ollama running on a judge's computer. Import
this folder into Google AI Studio and let its server-side `GEMINI_API_KEY` select
the hosted provider automatically. If an `AI_PROVIDER` environment value exists in
the hosted project, set it to `gemini` or remove it; never leave it as `ollama`.

Suggested import instruction:

> Import this app without redesigning it. Preserve local Ollama as the documented primary architecture and preserve the hosted-preview label when AI_PROVIDER is gemini. Keep Gemini calls server-side using the GEMINI_API_KEY secret. Verify GET /api/status, POST /api/analyze, and POST /api/ask, then share the app.

In the video, show local Gemma mode first. Explain that the AI Studio URL is a functionally equivalent hosted preview for judges.

## Cloud Run

The included `Dockerfile` builds and serves the hosted preview on `$PORT`. Cloud Run cannot reach a user's local Ollama instance, so configure `AI_PROVIDER=gemini` and add `GEMINI_API_KEY` as a secret.

## Demo path

1. Confirm the header says `Local gemma4:12b`.
2. Load the included Atlas pilot transcript.
3. Select **Build knowledge**.
4. Open evidence under a decision.
5. Switch to **Actions** to show owners and deadlines.
6. Switch to **Ask memory** and ask, "What could block the launch?"
7. Ask something absent from the transcript to demonstrate a grounded refusal.

## Verification

```powershell
npm test
npm run typecheck
npm run build
```

With Ollama running, `GET /api/status` must report `ready: true`, `privacy: local`,
and `model: gemma4:12b` before recording the demo.
