export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    return;
  }

  const { content } = req.body || {};
  if (!content || !String(content).trim()) {
    res.status(400).json({ error: "Empty content" });
    return;
  }

  const SYSTEM_PROMPT =
    "You are a senior design-prompt engineer for Google Stitch. From raw user content, build a concise structured design brief, then write exactly 3 distinct Stitch prompts. Each prompt must specify: product type and platform (App or Web), screen list with navigation pattern, core interactions, color palette direction, typography direction, mood, component style. 90-150 words each, concrete, visually directive. Directions: 1) Functional/Minimal, 2) Bold/Expressive, 3) Journey-centric. Return only JSON matching the schema.";

  const OUTPUT_SCHEMA = {
    type: "OBJECT",
    properties: {
      brief: {
        type: "OBJECT",
        properties: {
          productName: { type: "STRING" },
          oneLiner: { type: "STRING" },
          targetAudience: { type: "STRING" },
          platform: { type: "STRING", enum: ["App", "Web"] },
          tone: { type: "STRING" },
          screens: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["productName", "oneLiner", "targetAudience", "platform", "tone", "screens"]
      },
      prompts: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            angle: { type: "STRING", enum: ["Functional / Minimal", "Bold / Expressive", "Journey-centric"] },
            platform: { type: "STRING", enum: ["App", "Web"] },
            promptText: { type: "STRING" }
          },
          required: ["angle", "platform", "promptText"]
        }
      }
    },
    required: ["brief", "prompts"]
  };

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: "RAW CONTENT:\n" + content }] }],
    generationConfig: {
      temperature: 0.8,
      response_mime_type: "application/json",
      response_schema: OUTPUT_SCHEMA
    }
  };

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify(payload)
      }
    );

    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: "Gemini error " + r.status + ": " + t });
      return;
    }

    const data = await r.json();
    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json(JSON.parse(text));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
