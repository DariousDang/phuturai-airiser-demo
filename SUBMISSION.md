# AI Riser Vietnam submission pack

## Positioning

**Project:** Phuturai — Private AI Memory  
**Track:** Enterprise utility / open theme  
**One-line pitch:** Turn meeting transcripts into decisions, assigned actions, risks,
and grounded answers with exact evidence—using Gemma locally so organizational memory
does not need to leave the user's machine.

The judge-accessible AI Studio build uses Gemini 3.7 Flash as a clearly labeled hosted
preview. The submitted story is not “another summarizer”; it is a local-first,
evidence-preserving memory layer that refuses unsupported answers.

## What is ready

- Local Gemma 4 12B through Ollama on Intel Arc B580, verified at 100% GPU.
- Transcript → cited knowledge → grounded Q&A flow.
- Exact evidence hydration from original transcript lines.
- Prompt-injection resistance and grounded refusal behavior.
- Responsive competition UI, production Node server, and Cloud Run Dockerfile.
- Rehearsal mode for recording if a live model is unavailable.
- Hosted Gemini provider for the required AI Studio judging preview.

## Account-owned steps — do these immediately

1. Push the latest repository to GitHub.
2. Open Google AI Studio → **Build → New app**, import the GitHub repository/folder if
   offered, and use [AI_STUDIO_PROMPT.md](./AI_STUDIO_PROMPT.md) as the build request.
3. Add `GEMINI_API_KEY` as a server-side secret. Set `AI_PROVIDER=gemini` and
   `GEMINI_MODEL=gemini-3.7-flash` if AI Studio exposes environment settings.
4. Run all four prompt acceptance cases in AI Studio Preview.
5. Select **Share → Public → Copy link**. Do not submit a private or editor-only URL.
6. Record the two-minute demo below, upload it publicly to YouTube, and copy its URL.
7. Publish the prepared LinkedIn/Facebook post and copy its public URL.
8. Open the official completion form and submit the AI Studio, YouTube, and social
   links. Add a Cloud Run URL only if you deploy one.

Cloud Run is optional but worth bonus points. Do not let it delay the mandatory AI
Studio link, video, post, and form.

## 115-second demo script

**0:00–0:12 — Problem**  
“Meetings disappear into folders, and cloud assistants ask teams to upload sensitive
conversations. Phuturai turns a transcript into trustworthy organizational memory
while the main product runs on the user's own machine.”

**0:12–0:24 — Local architecture**  
Show the header status `Local gemma4:12b` and the local-processing disclosure.  
“This is Gemma 4 12B through Ollama on an Intel Arc B580. The transcript stays on this
computer; Gemini powers only the clearly labeled hosted preview for judges.”

**0:24–0:50 — Build knowledge**  
Load the Atlas transcript and click **Build knowledge**.  
“One flow turns raw conversation into a brief, decisions, actions with owners and
deadlines, facts, and risks.”

**0:50–1:08 — Evidence**  
Open evidence for a decision, then switch to Actions.  
“Every claim drills into exact source lines. The model proposes line numbers, but the
server copies the quote from the original transcript, so it cannot invent evidence.”

**1:08–1:28 — Grounded Q&A**  
Ask: `What could block the launch?`  
“Answers use only this transcript and return the supporting lines.”

**1:28–1:42 — Refusal**  
Ask: `What is the office address?`  
“When the evidence is absent, Phuturai refuses instead of guessing.”

**1:42–1:55 — Close**  
“Phuturai starts with transcripts and expands into a private memory layer for calls,
documents, and teams—local by default, grounded by design.”

Leave five seconds of margin. Keep the video under two minutes.

## Public post copy

I built **Phuturai — Private AI Memory** for AI Riser Vietnam 2026.

Phuturai turns meeting transcripts into a cited knowledge brief: decisions, assigned
actions, facts, risks, and grounded answers. The important difference is trust and
privacy: every output links back to exact transcript lines, unsupported questions are
refused, and the main product runs Google's open Gemma model locally through Ollama.

For judging, I also created a clearly labeled hosted Gemini preview in Google AI
Studio so anyone can try the same end-to-end flow.

Demo: [YOUTUBE LINK]  
AI Studio: [PUBLIC AI STUDIO LINK]

#AIRiserVietnam #BuildwithGoogleAI #Gemma #Gemini #LocalAI #OpenSource

## Final form checklist

- [ ] AI Studio project opens without requesting access.
- [ ] Build/Preview works and identifies itself as the hosted Gemini preview.
- [ ] YouTube video is public and no longer than two minutes.
- [ ] Social post is public and includes `#AIRiserVietnam #BuildwithGoogleAI`.
- [ ] Form contains the public AI Studio, video, and post links.
- [ ] Optional Cloud Run URL works in an incognito window.
- [ ] Final form confirmation is saved as a screenshot.
