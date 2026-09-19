import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const credPath = path.join(process.cwd(), 'credentials.json');
    let validUser = "admin";
    let validPass = "mahindra";

    if (fs.existsSync(credPath)) {
      const data = fs.readFileSync(credPath, 'utf8');
      const creds = JSON.parse(data);
      if (creds.username) validUser = creds.username;
      if (creds.password) validPass = creds.password;
    }

    if (username === validUser && password === validPass) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
