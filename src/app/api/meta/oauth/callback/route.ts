import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'meta_config.json');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/campaigns?error=NoCode`);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/meta/oauth/callback`;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`);
    const tokenData = await tokenRes.json();
    
    if (tokenData.access_token) {
      // 2. Save securely to local JSON (Acting as our simple Database)
      const config = {
        access_token: tokenData.access_token,
        connected_at: new Date().toISOString()
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
      
      // 3. Redirect back to UI with success
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/campaigns?success=true`);
    } else {
      console.error("Meta Token Error:", tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/campaigns?error=TokenExchangeFailed`);
    }
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/campaigns?error=ServerError`);
  }
}
