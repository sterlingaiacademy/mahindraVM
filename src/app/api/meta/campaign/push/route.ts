import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'meta_config.json');

export async function POST(req: NextRequest) {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return NextResponse.json({ error: "Meta account not connected." }, { status: 401 });
    }
    
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const token = config.access_token;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      return NextResponse.json({ error: "Missing Meta credentials." }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumbers } = body; // Array of phone numbers for bulk push

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return NextResponse.json({ error: "No phone numbers provided." }, { status: 400 });
    }

    let successes = 0;
    let failures = 0;

    // Iterate and blast messages
    for (const targetPhone of phoneNumbers) {
      const payload = {
        messaging_product: "whatsapp",
        to: targetPhone,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" }
        }
      };

      const res = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        successes++;
      } else {
        failures++;
        const err = await res.json();
        console.error(`Failed to send to ${targetPhone}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bulk push complete! Sent: ${successes}, Failed: ${failures}.` 
    });

  } catch (error) {
    console.error("Bulk Push Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
