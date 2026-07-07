import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ voices: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ voices: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Map ElevenLabs voices to a standard schema
    const voices = data.voices.map((v: any) => ({
      voice_id: v.voice_id,
      name: `✨ ${v.name} (ElevenLabs)`,
      lang: "Cloud Neural",
      isEleven: true,
    }));

    return new Response(JSON.stringify({ voices }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ voices: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
