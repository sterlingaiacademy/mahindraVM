import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'meta_config.json');

export async function GET() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return NextResponse.json({ 
        connected: true, 
        connected_at: data.connected_at || new Date().toISOString(),
        token_active: true
      });
    } catch(e) {
      return NextResponse.json({ connected: false });
    }
  }
  return NextResponse.json({ connected: false });
}
