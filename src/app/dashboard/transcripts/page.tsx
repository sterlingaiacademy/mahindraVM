import { TranscriptsListClient } from "@/components/TranscriptsListClient";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Disable caching

async function getConversations() {
  const agentConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_AGENT_ID' } });
  const apiConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_API_KEY' } });
  
  const AGENT_ID = agentConfig?.value || process.env.ELEVENLABS_AGENT_ID || "";
  const API_KEY = apiConfig?.value || process.env.ELEVENLABS_API_KEY || "";

  if (!AGENT_ID || !API_KEY) return [];

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}`, {
    headers: { "xi-api-key": API_KEY },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch conversations from AI Engine");
  const data = await res.json();
  return data.conversations || [];
}

async function getTranscript(convId: string) {
  const apiConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_API_KEY' } });
  const API_KEY = apiConfig?.value || process.env.ELEVENLABS_API_KEY || "";

  if (!API_KEY) return null;

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${convId}`, {
    headers: { "xi-api-key": API_KEY },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TranscriptsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: selectedId } = await searchParams;
  let conversations: any[] = [];
  let error = null;

  try {
    conversations = await getConversations();
    // Default sort
    conversations.sort((a: any, b: any) => b.start_time_unix_secs - a.start_time_unix_secs);
  } catch (e: any) {
    error = e.message;
  }

  let selectedData = null;
  if (selectedId) {
    selectedData = await getTranscript(selectedId);
  }

  return (
    <TranscriptsListClient 
      conversations={conversations} 
      selectedId={selectedId} 
      selectedData={selectedData} 
      error={error} 
    />
  );
}
