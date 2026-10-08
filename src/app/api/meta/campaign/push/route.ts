import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumbers, adBody, adFooter, buttonText, buttonUrl, imageBlob } = await req.json();

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

    let mediaId: string | null = null;
    
    // Upload image to Meta Media API if provided
    if (imageBlob && typeof imageBlob === 'string' && imageBlob.startsWith('data:image/')) {
      try {
        const matches = imageBlob.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const blob = new Blob([buffer], { type: mimeType });
          
          const formData = new FormData();
          formData.append('messaging_product', 'whatsapp');
          formData.append('file', blob, 'banner.jpg');
          
          const uploadRes = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/media`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${access_token}` },
            body: formData
          });
          
          const uploadData = await uploadRes.json();
          if (uploadData.id) {
            mediaId = uploadData.id;
          } else {
            console.error("Meta Media Upload Error:", uploadData);
          }
        }
      } catch (err) {
        console.error("Failed to process/upload image:", err);
      }
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const phone of phoneNumbers) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      let payload: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: true,
          body: adBody || "Hello from Mahindra AI!"
        }
      };

      // Meta API limitation: Interactive cta_url messages DO NOT support media IDs in headers, 
      // they only support HTTPS links. Since we use base64 uploads (media IDs), we must send 
      // the image as a standalone message first, followed by the interactive button.
      if (mediaId) {
        const imagePayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "image",
          image: { id: mediaId }
        };
        
        await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(imagePayload)
        });
      }

      // If a button URL is provided, format it as an interactive CTA URL message
      if (buttonUrl && buttonText) {
        payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "interactive",
          interactive: {
            type: "cta_url",
            body: {
              text: adBody || "Hello from Mahindra AI!"
            },
            footer: adFooter ? { text: adFooter } : undefined,
            action: {
              name: "cta_url",
              parameters: {
                display_text: buttonText,
                url: buttonUrl
              }
            }
          }
        };
        
        // Clean up undefined fields
        if (!payload.interactive.footer) delete payload.interactive.footer;
      }

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
