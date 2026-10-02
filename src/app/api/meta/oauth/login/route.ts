import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/meta/oauth/callback`;
  
  // Scopes required for WhatsApp and Ads
  const scopes = "whatsapp_business_management,whatsapp_business_messaging,pages_manage_ads,pages_read_engagement";
  
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
  
  return NextResponse.redirect(authUrl);
}
