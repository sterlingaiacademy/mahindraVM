import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8080/outbound";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "";
const STATUS_FILE = path.join(process.cwd(), 'campaign_status.json');

const CALL_TIMEOUT_MS = 5 * 60 * 1000;  // 5 min max per call
const POLL_INTERVAL_MS = 8000;           // check ElevenLabs every 8s
const CALL_CONNECT_WAIT_MS = 15000;      // wait 15s for call to connect before polling
const BETWEEN_CALLS_BUFFER_MS = 4000;   // 4s buffer between each call

export type ContactStatus = {
  phone: string;
  name: string;
  vehicle: string;
  status: 'queued' | 'calling' | 'done' | 'failed' | 'skipped';
  error?: string;
};

export type CampaignStatus = {
  status: 'idle' | 'running' | 'done';
  startedAt?: string;
  finishedAt?: string;
  total: number;
  current: number;
  contacts: ContactStatus[];
};

function writeStatus(data: CampaignStatus) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[Campaign] Failed to write status:', e);
  }
}

async function waitForCallToComplete(phone: string, triggerTimeMs: number): Promise<'done' | 'failed' | 'timeout'> {
  const deadline = Date.now() + CALL_TIMEOUT_MS;
  const triggerTimeSecs = Math.floor(triggerTimeMs / 1000);

  // Wait for the call to actually connect before starting to poll
  await new Promise(r => setTimeout(r, CALL_CONNECT_WAIT_MS));

  const last10Digits = phone.replace(/\D/g, '').slice(-10);

  while (Date.now() < deadline) {
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${ELEVENLABS_AGENT_ID}&page_size=10`,
        { headers: { 'xi-api-key': ELEVENLABS_API_KEY } }
      );

      if (res.ok) {
        const data = await res.json();
        const convos = (data.conversations || []) as any[];

        // Find a conversation started within 90s of our trigger with a matching phone number
        const match = convos.find((c: any) => {
          const startSecs = c.start_time_unix_secs || 0;
          const inWindow = startSecs >= (triggerTimeSecs - 10) && startSecs <= (triggerTimeSecs + 90);
          const toNum: string = c.metadata?.phone_call?.to_number || '';
          const phoneMatch = toNum === '' || toNum.replace(/\D/g, '').endsWith(last10Digits);
          return inWindow && phoneMatch;
        });

        if (match) {
          if (match.status === 'done') {
            console.log(`[Campaign] Call to ${phone} completed. Success: ${match.call_successful}`);
            return match.call_successful === 'success' ? 'done' : 'failed';
          }
          // still in_progress — keep polling
          console.log(`[Campaign] Call to ${phone} still in progress...`);
        } else {
          console.log(`[Campaign] No matching conversation found yet for ${phone}, polling...`);
        }
      }
    } catch (e) {
      console.error('[Campaign] ElevenLabs polling error:', e);
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  console.warn(`[Campaign] Call to ${phone} timed out after 5 minutes`);
  return 'timeout';
}

async function processBulkCampaign(contacts: ContactStatus[]) {
  const state: CampaignStatus = {
    status: 'running',
    startedAt: new Date().toISOString(),
    total: contacts.length,
    current: 0,
    contacts: contacts.map(c => ({ ...c, status: 'queued' })),
  };
  writeStatus(state);

  for (let i = 0; i < contacts.length; i++) {
    state.current = i;
    state.contacts[i].status = 'calling';
    writeStatus(state);

    const contact = state.contacts[i];

    if (!contact.phone) {
      contact.status = 'skipped';
      contact.error = 'No phone number';
      writeStatus(state);
      continue;
    }

    const triggerTime = Date.now();

    try {
      const payload = {
        phone: contact.phone,
        agent_id: ELEVENLABS_AGENT_ID,
        conversation_variables: {
          customer_name: contact.name,
          vehicle: contact.vehicle,
          Direction: 'Outbound',
          direction: 'Outbound',
          phone: contact.phone,
        },
      };

      console.log(`[Campaign] (${i + 1}/${contacts.length}) Calling ${contact.phone} (${contact.name})...`);

      const response = await fetch(PYTHON_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        contact.status = 'failed';
        contact.error = `Server error ${response.status}: ${errorText}`;
        writeStatus(state);
        continue;
      }

      // Wait for the call to finish before dialing the next one
      const result = await waitForCallToComplete(contact.phone, triggerTime);

      if (result === 'done') {
        contact.status = 'done';
      } else if (result === 'timeout') {
        contact.status = 'done';
        contact.error = 'Completed (5-min timeout reached)';
      } else {
        contact.status = 'failed';
        contact.error = 'Call ended unsuccessfully';
      }
    } catch (e: any) {
      contact.status = 'failed';
      contact.error = e.message || 'Unknown error';
    }

    writeStatus(state);

    // Small breathing room between calls
    if (i < contacts.length - 1) {
      await new Promise(r => setTimeout(r, BETWEEN_CALLS_BUFFER_MS));
    }
  }

  state.status = 'done';
  state.finishedAt = new Date().toISOString();
  state.current = contacts.length;
  writeStatus(state);
  console.log('[Campaign] All done!');
}

export async function POST(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { contacts } = await req.json();

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid contacts list' }, { status: 400 });
    }
    if (contacts.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 contacts per campaign' }, { status: 400 });
    }

    // Block if already running
    try {
      const existing: CampaignStatus = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      if (existing.status === 'running') {
        return NextResponse.json({ error: 'A campaign is already running. Wait for it to finish.' }, { status: 409 });
      }
    } catch (_) {}

    const prepared: ContactStatus[] = contacts
      .map((row: any) => ({
        phone: (row.phone || row.Phone || row.PHONE || row.phone_number || row.Phone_Number || '').trim(),
        name: row.customer_name || row.name || row.Name || 'Unknown',
        vehicle: row.vehicle || row.vehicle_name || '',
        status: 'queued' as const,
      }))
      .filter((c: ContactStatus) => c.phone !== '');

    if (prepared.length === 0) {
      return NextResponse.json({ error: 'No valid phone numbers found in the list' }, { status: 400 });
    }

    // Fire background loop — PM2 keeps it alive after response is sent
    processBulkCampaign(prepared);

    return NextResponse.json({
      success: true,
      message: `Sequential campaign started for ${prepared.length} contacts. Calling one at a time.`,
      total: prepared.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
