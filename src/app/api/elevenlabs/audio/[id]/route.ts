import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return new NextResponse("Missing conversation ID", { status: 400 });
  }

  const apiKey = "sk_c86898a6cdbb6520c0af7f74c198f9a1260111d1ad4d2967";
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${id}/audio`, {
      headers: {
        "xi-api-key": apiKey
      }
    });

    if (!response.ok) {
      return new NextResponse(`ElevenLabs API Error: ${response.status}`, { status: response.status });
    }

    // Proxy the audio stream directly back to the client
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "audio/mpeg");
    headers.set("Content-Disposition", `inline; filename="conversation_${id}.mp3"`);
    
    return new NextResponse(response.body, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error("Audio fetch error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
