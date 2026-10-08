export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // Fetch from DB
  const appIdConfig = await prisma.systemConfig.findUnique({ where: { key: 'META_APP_ID' } });
  const appId = appIdConfig?.value;
  
  if (!appId) {
    return NextResponse.json({ error: 'META_APP_ID not configured in Settings' }, { status: 400 });
  }

  // Always detect base URL from the actual incoming request host.
  // NEVER use NEXT_PUBLIC_BASE_URL — it gets frozen at build time and breaks on remote servers.
  const url = new URL(req.url);
  // Use X-Forwarded-Host if behind a proxy, otherwise use the direct host
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const redirectUri = `${proto}://${host}/api/meta/oauth/callback`;
  
  // Scopes required for WhatsApp and Ads
  const scopes = "whatsapp_business_management,whatsapp_business_messaging,pages_manage_ads,pages_read_engagement";
  
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
  
  return NextResponse.redirect(authUrl);
}

