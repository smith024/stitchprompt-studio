# StitchPrompt Studio

Raw ideas → 3 Stitch-ready design prompts.

Paste raw text or drop a file — the app analyses it automatically, builds an editable
Design Brief, and generates 3 distinct Stitch prompts (Functional/Minimal,
Bold/Expressive, Journey-centric) with Copy + Open Stitch actions.

## How to use
1. Paste content or drop a file (analysis starts automatically).
2. Review / edit the Design Brief.
3. Copy your favourite prompt into Google Stitch: https://stitch.withgoogle.com

## Stack
- Static frontend: `index.html`
- Vercel serverless function: `api/analyze.js` (calls the Gemini API)
- Requires `GEMINI_API_KEY` as a Vercel environment variable (never commit the real key)

## Deploy
Import this repo into Vercel (Framework Preset: Other), set `GEMINI_API_KEY`, deploy.
