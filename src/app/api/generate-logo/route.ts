import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, n = 1 } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Use GPT-image-1-mini for cost efficiency (~$0.02/image at medium)
    // Try gpt-image-1 first, fall back to dall-e-3
    const count = Math.min(n, 4);
    
    const results: string[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt + (i > 0 ? ` (variation ${i + 1})` : ""),
            n: 1,
            size: "1024x1024",
            quality: "standard",
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error(`Image gen error: ${err}`);
          continue;
        }

        const data = await response.json();
        if (data.data?.[0]?.url) {
          results.push(data.data[0].url);
        }
      } catch (e) {
        console.error(`Image gen attempt ${i} failed:`, e);
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "All image generations failed" }, { status: 500 });
    }

    return NextResponse.json({ images: results });
  } catch (e) {
    console.error("Generate logo error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
