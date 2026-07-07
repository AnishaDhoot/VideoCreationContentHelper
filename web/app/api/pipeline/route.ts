import { NextRequest } from "next/server";
import { Groq } from "groq-sdk";

export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { raw_input } = await req.json();

    if (!raw_input || typeof raw_input !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid raw_input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // ==========================================
          // STAGE 1: Editor Node
          // ==========================================
          sendEvent("stage_start", { stage: "editor", message: "Stage 1: Cleaning grammar and tone..." });
          
          let editedText = "";
          const editorPrompt = `You are a professional editor. Please edit the following text for grammar, spelling, and tone. while keeping the core message intact. return only the edited text:\n\nText:\n${raw_input}`;
          
          const editorCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: editorPrompt }],
            temperature: 0.7,
            stream: true,
          });

          for await (const chunk of editorCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              editedText += content;
              sendEvent("chunk", { stage: "editor", text: content });
            }
          }
          
          sendEvent("stage_complete", { stage: "editor", result: editedText.trim() });

          // ==========================================
          // STAGE 2: Scriptwriter Node
          // ==========================================
          sendEvent("stage_start", { stage: "scriptwriter", message: "Stage 2: Creating YouTuber video hook..." });
          
          let scriptText = "";
          const scriptPrompt = `You are a professional scriptwriter and charismatic Youtube content creator. You are writing a video script . Please create a script based on the following text and transform it into a highly engaging, punchy, conversational video script hook. Make it sound like a real person speaking passionately. return only the script:\n\nEdited Text:\n${editedText.trim()}`;
          
          const scriptCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: scriptPrompt }],
            temperature: 0.7,
            stream: true,
          });

          for await (const chunk of scriptCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              scriptText += content;
              sendEvent("chunk", { stage: "scriptwriter", text: content });
            }
          }
          
          sendEvent("stage_complete", { stage: "scriptwriter", result: scriptText.trim() });

          // ==========================================
          // STAGE 3: Translator Node
          // ==========================================
          sendEvent("stage_start", { stage: "translator", message: "Stage 3: Translating script into flowing Hinglish..." });
          
          let finalTranslatorText = "";
          const translatorPrompt = `You are an expert content localizer for the Indian market. Take the following script and convert it into natural, flowing 'Hinglish'. Do not simply translate it sentence-by-sentence or repeat information. Alternating comfortably between Hindi and English phrases just like an intellectual tech educator would speak naturally on a live stream. Keep the energy high! Return only the final Hinglish text.\n\nScript:\n${scriptText.trim()}`;
          
          const translatorCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: translatorPrompt }],
            temperature: 0.7,
            stream: true,
          });

          for await (const chunk of translatorCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              finalTranslatorText += content;
              sendEvent("chunk", { stage: "translator", text: content });
            }
          }
          
          sendEvent("stage_complete", { stage: "translator", result: finalTranslatorText.trim() });

          // ==========================================
          // STAGE 4: Analyzer Node (JSON Output Mode)
          // ==========================================
          sendEvent("stage_start", { stage: "analyzer", message: "Stage 4: Running AI Engagement & Storyboard Analysis..." });

          const analyzerPrompt = `
          You are an expert YouTube content consultant and media analyst. Analyze the following Hinglish script and provide performance scoring and storyboard visual/audio suggestions.
          
          You must return a JSON object with the exact structure below. Do not add any backticks, markdown markers, or text outside the JSON object.
          
          {
            "scores": {
              "retention": 85, // 0-100 rating for how well the hook captures the first 3 seconds
              "pacing": 90,     // 0-100 rating for vocabulary flow, punchiness, and reading speed
              "resonance": 80   // 0-100 rating for emotional charm, local relevance, and Hinglish naturalness
            },
            "tips": [
              "Always open with a visual pattern interrupt in the first 2 seconds.",
              "Use high vocal pitch fluctuation on tech English words."
            ],
            "storyboard": [
              {
                "time": "0s - 3s",
                "visual": "Zoom in on camera, display big bold red text overlay: 'REVOLUTION'.",
                "sfx": "Distant sub-bass drop, followed by record scratch."
              },
              {
                "time": "3s - 10s",
                "visual": "B-roll of modern coding screens or typing hands with cyberpunk glow.",
                "sfx": "Lofi hip-hop beat kicks in gently in the background."
              },
              {
                "time": "10s - 20s",
                "visual": "A split-screen showing a traditional graph going down and AI line going up.",
                "sfx": "Swoosh transition sound effect."
              }
            ]
          }

          Hinglish Script to Analyze:
          ${finalTranslatorText.trim()}
          `;

          const analyzerCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: analyzerPrompt }],
            temperature: 0.5,
            response_format: { type: "json_object" },
          });

          const resultText = analyzerCompletion.choices[0]?.message?.content || "{}";
          let parsedData = {};
          try {
            parsedData = JSON.parse(resultText);
          } catch (e) {
            parsedData = {
              scores: { retention: 70, pacing: 70, resonance: 70 },
              tips: ["Failed to parse AI Analysis. Check script format."],
              storyboard: [{ time: "0s", visual: "No cues generated.", sfx: "None" }]
            };
          }

          sendEvent("stage_complete", { stage: "analyzer", result: parsedData });
          
          sendEvent("pipeline_complete", { message: "All stages completed successfully!" });
          controller.close();
        } catch (error: any) {
          sendEvent("error", { message: error.message || "An error occurred during execution." });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
