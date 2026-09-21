import { LogsTableClient } from "@/components/LogsTableClient";

const API_KEY = "sk_c86898a6cdbb6520c0af7f74c198f9a1260111d1ad4d2967";
const AGENT_ID = "agent_1201m313x98jenasy4knjk1hme5q";

export const revalidate = 0;

async function getConversations() {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}`, {
    headers: { "xi-api-key": API_KEY },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch conversations from ElevenLabs");
  const data = await res.json();
  return data.conversations || [];
}

export default async function CallLogsPage() {
  let logs: any[] = [];
  let error: string | null = null;

  try {
    const conversations = await getConversations();
    
    logs = conversations.map((conv: any) => {
      const dc = conv.data_collection_results || {};
      
      const getValue = (key: string) => {
        if (dc[key] && dc[key].value !== undefined && dc[key].value !== null) {
          return String(dc[key].value);
        }
        return "";
      };

      return {
        "Call Date": new Date(conv.start_time_unix_secs * 1000).toISOString(),
        "Direction": getValue("direction") || (conv.conversation_initiation_source === "agent" ? "Outbound" : "Inbound"),
        "Customer Name": getValue("customer_name") || "Unknown",
        "Phone Number": getValue("phone_number") || "-",
        "Vehicle Model": getValue("vehicle_model") || "-",
        "Enquiry Type": getValue("enquiry_type") || "-",
        "Service Type": getValue("service_type") || "",
        "Visit Day": getValue("visit_day") || "",
        "Visit Time": getValue("visit_time") || "",
      };
    });

  } catch (err: any) {
    console.error(err);
    error = err.message || "Failed to load from ElevenLabs";
  }

  return <LogsTableClient initialLogs={logs} error={error} />;
}
