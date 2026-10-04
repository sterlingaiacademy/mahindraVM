import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumbers } = await req.json();

    const config = await prisma.systemConfig.findUnique({
      where: { key: 'META_CONFIG' }
    });

    if (!config || !config.value) {
      return NextResponse.json({ error: "Meta account not connected" }, { status: 400 });
    }

    const { access_token } = JSON.parse(config.value);
    const phoneConfig = await prisma.systemConfig.findUnique({ where: { key: 'META_PHONE_NUMBER_ID' } });
    const phoneNumberId = phoneConfig?.value;

    if (!phoneNumberId) {
      return NextResponse.json({ error: "META_PHONE_NUMBER_ID is not configured in settings." }, { status: 500 });
    }

    let successCount = 0;
    
    for (const phone of phoneNumbers) {
      const payload = {
        messaging_product: "whatsapp",
        to: phone.replace(/[^0-9]/g, ''),
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" }
        }
      };

      const res = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) successCount++;
    }

    return NextResponse.json({ success: true, message: `Sent ${successCount}/${phoneNumbers.length} messages successfully` });
  } catch (error: any) {
    console.error("Push Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
