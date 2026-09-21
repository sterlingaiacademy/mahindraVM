import { NextResponse } from 'next/server';

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8080/outbound";

export async function POST(req: Request) {
  try {
    const { contacts } = await req.json();

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: "Invalid contacts list" }, { status: 400 });
    }

    // Kick off the background process WITHOUT awaiting it, 
    // so we can respond to the frontend immediately.
    // Since this is running on your PM2 Node server, this loop will 
    // stay alive in the background even if the user closes their browser.
    processBulkCampaign(contacts);

    return NextResponse.json({ 
      success: true, 
      message: `Background campaign successfully started for ${contacts.length} contacts.` 
    });

  } catch (error: any) {
    console.error("[Bulk Outbound] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// The background worker loop
async function processBulkCampaign(contacts: any[]) {
  console.log(`Starting bulk campaign for ${contacts.length} contacts...`);
  
  for (let i = 0; i < contacts.length; i++) {
    const row = contacts[i];
    let phoneNumber = row.phone || row.Phone || row.PHONE || row.phone_number || row.Phone_Number;
    
    if (phoneNumber) {
      phoneNumber = String(phoneNumber).trim();

      const payload = {
        phone: phoneNumber,
        agent_id: "agent_1201m313x98jenasy4knjk1hme5q",
        conversation_variables: row
      };

      try {
        const response = await fetch(PYTHON_SERVER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          console.error(`Row ${i+1}: Python Server Error for ${phoneNumber}`);
        } else {
          console.log(`Row ${i+1}: Successfully triggered call to ${phoneNumber}`);
        }
      } catch (e) {
        console.error(`Row ${i+1}: Network error reaching Python server for ${phoneNumber}:`, e);
      }
    }
    
    // Strict 1-second pacing delay to protect the SIP trunk and APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("Bulk campaign completely finished.");
}
