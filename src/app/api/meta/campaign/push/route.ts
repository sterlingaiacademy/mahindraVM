import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumbers, adBody } = await req.json();

    const config = await prisma.systemConfig.findUnique({
      where: { key: 'META_CONFIG' }
    });

    if (!config || !config.value) {
      return NextResponse.json({ error: "Meta account not connected. Please paste your Permanent Access Token in Account Config and save." }, { status: 400 });
    }

    const { access_token } = JSON.parse(config.value);
    const phoneConfig = await prisma.systemConfig.findUnique({ where: { key: 'META_PHONE_NUMBER_ID' } });
    const phoneNumberId = phoneConfig?.value?.trim();

    if (!phoneNumberId) {
      return NextResponse.json({ error: "WhatsApp Phone Number ID is not configured in Account Config." }, { status: 500 });
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const phone of phoneNumbers) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: false,
          body: adBody || "Hello from Mahindra AI!"
        }
      };

      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        successCount++;
      } else {
        const err = await res.json();
        const errMsg = err?.error?.message || JSON.stringify(err);
        console.error("WA API Error for", cleanPhone, ":", errMsg);
        errors.push(`${cleanPhone}: ${errMsg}`);
      }
    }

    if (successCount === 0 && errors.length > 0) {
      return NextResponse.json({
        error: `WhatsApp API rejected all messages. Error: ${errors[0]}`,
        details: errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Sent to ${successCount}/${phoneNumbers.length} contacts.${errors.length > 0 ? ` ${errors.length} failed.` : ''}`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Push Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
