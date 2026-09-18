import { NextResponse } from 'next/server';

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8080/outbound";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Pass the request directly to the Python server running on GCP
    const response = await fetch(PYTHON_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Python Server Error: ${errorText}` }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[Outbound] Error proxying to Python server:", error);
    return NextResponse.json(
      { error: `Could not connect to Python server at ${PYTHON_SERVER_URL}. Ensure the python outbound_server is running.` }, 
      { status: 500 }
    );
  }
}
