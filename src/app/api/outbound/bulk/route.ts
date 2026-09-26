import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8080/outbound";
// We deduce the status URL automatically based on the outbound URL
const PYTHON_STATUS_BASE_URL = PYTHON_SERVER_URL.replace('/outbound', '/status');

const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "";
const STATUS_FILE = path.join(process.cwd(), 'campaign_status.json');

const CALL_TIMEOUT_MS = 5 * 60 * 1000;  // 5 min max per call
const POLL_INTERVAL_MS = 2500;           // check LiveKit every 2.5s
const CALL_CONNECT_WAIT_MS = 3000;       // wait 3s before polling (let AI join room)
const BETWEEN_CALLS_BUFFER_MS = 2000;    // 2s buffer between each call

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

async function waitForLiveKitRoom(roomName: string, phone: string): Promise<'done' | 'timeout' | 'failed'> {
  const deadline = Date.now() + CALL_TIMEOUT_MS;
  
  // Wait a few seconds for the room to initialize and participants to join
  await new Promise(r => setTimeout(r, CALL_CONNECT_WAIT_MS));

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${PYTHON_STATUS_BASE_URL}/${roomName}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ended') {
          console.log(`[Campaign] LiveKit room ${roomName} ended for ${phone}.`);
          return 'done';
        } else {
          console.log(`[Campaign] Call to ${phone} active in ${roomName} (Participants: ${data.participant_count})...`);
        }
      } else {
         // If Python returns 404, the room is completely gone
         if (res.status === 404) return 'done';
      }
    } catch (e) {
      console.error(`[Campaign] Polling error for ${roomName}:`, e);
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

    // 1. Phone Sanitization (Strip everything except digits and '+')
    const safePhone = contact.phone.replace(/[^\d+]/g, '');

    // 2. Generate unique UUID for this call
    const callId = randomUUID();

    try {
      const payload = {
        phone: safePhone,
        agent_id: ELEVENLABS_AGENT_ID,
        call_id: callId,
        conversation_variables: {
          customer_name: contact.name,
          vehicle: contact.vehicle,
          Direction: 'Outbound',
          direction: 'Outbound',
          phone: safePhone,
          call_id: callId // Inject into ElevenLabs context
        },
      };

      console.log(`[Campaign] (${i + 1}/${contacts.length}) Calling ${safePhone} (${contact.name})...`);

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
      
      const resultData = await response.json();
      const roomName = resultData.room_name;

      if (roomName) {
        // 3. New LiveKit Real-Time Tracking
        const result = await waitForLiveKitRoom(roomName, safePhone);
        if (result === 'done') {
          contact.status = 'done';
        } else if (result === 'timeout') {
          contact.status = 'done';
          contact.error = 'Completed (5-min timeout reached)';
        } else {
          contact.status = 'failed';
          contact.error = 'Call ended unsuccessfully';
        }
      } else {
         // Fallback if no room_name returned from python for some reason
         contact.status = 'done';
         contact.error = 'Warning: No room tracking available';
         await new Promise(r => setTimeout(r, 60000)); // 1 min fake delay
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
