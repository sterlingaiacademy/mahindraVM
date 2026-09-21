import { Search, Mic, PhoneCall, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

const API_KEY = "sk_c86898a6cdbb6520c0af7f74c198f9a1260111d1ad4d2967";
const AGENT_ID = "agent_1201m313x98jenasy4knjk1hme5q";

export const revalidate = 0; // Disable caching

async function getConversations() {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}`, {
    headers: { "xi-api-key": API_KEY },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = await res.json();
  return data.conversations || [];
}

async function getTranscript(convId: string) {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${convId}`, {
    headers: { "xi-api-key": API_KEY },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TranscriptsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: selectedId } = await searchParams;
  let conversations = [];
  let error = null;

  try {
    conversations = await getConversations();
    // Sort by newest first
    conversations.sort((a: any, b: any) => b.start_time_unix_secs - a.start_time_unix_secs);
  } catch (e: any) {
    error = e.message;
  }

  let selectedData = null;
  if (selectedId) {
    selectedData = await getTranscript(selectedId);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex h-[calc(100vh-2rem)] gap-6">
      
      {/* Left List Pane */}
      <div className="w-1/3 flex flex-col bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/10 rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-mahindra-red" />
            Raw Transcripts
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {error ? (
            <div className="p-4 text-red-500 text-sm">{error}</div>
          ) : conversations.map((conv: any) => {
            const isSelected = selectedId === conv.conversation_id;
            const date = new Date(conv.start_time_unix_secs * 1000).toLocaleString('en-IN', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const isSuccess = conv.call_successful === "success";

            return (
              <Link 
                key={conv.conversation_id}
                href={`/dashboard/transcripts?id=${conv.conversation_id}`}
                className={`block p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-mahindra-red/5 dark:bg-mahindra-red/10 border-l-2 border-l-mahindra-red' : 'border-l-2 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
                    {conv.call_summary_title || "Incoming Call"}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap shrink-0">{date}</div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <PhoneCall className="w-3 h-3" /> {Math.round(conv.call_duration_secs)}s
                  </div>
                  <div className="flex items-center gap-1">
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                      {conv.call_successful || "Failed"}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="flex-1 bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/10 rounded-sm shadow-sm flex flex-col overflow-hidden">
        {selectedData ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-white/10 shrink-0 bg-gray-50 dark:bg-white/5">
              <h2 className="text-2xl font-bold mb-2">Transcript Details</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div><strong>ID:</strong> <span className="font-mono text-xs">{selectedId}</span></div>
                <div><strong>Duration:</strong> {Math.round(selectedData.metadata?.call_duration_secs || 0)}s</div>
                <div><strong>Status:</strong> <span className="uppercase">{selectedData.status}</span></div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Call Audio</h3>
                <audio 
                  controls 
                  className="w-full h-10" 
                  src={`/api/elevenlabs/audio/${selectedId}`}
                  autoPlay={false}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedData.transcript?.map((turn: any, i: number) => {
                const isAgent = turn.role === "agent";
                return (
                  <div key={i} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 px-1">
                      {isAgent ? "Ananya (AI)" : "Customer"}
                    </span>
                    <div className={`p-4 rounded-sm max-w-[85%] text-sm leading-relaxed shadow-sm ${
                      isAgent 
                        ? 'bg-gray-100 dark:bg-mahindra-dark text-gray-900 dark:text-gray-100' 
                        : 'bg-mahindra-red text-white'
                    }`}>
                      {turn.message || <span className="italic opacity-50">No audio detected</span>}
                    </div>
                  </div>
                );
              })}
              {(!selectedData.transcript || selectedData.transcript.length === 0) && (
                <div className="text-center text-gray-500 italic py-10">No transcript available for this call.</div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
            <Mic className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="text-lg font-bold mb-2">Select a Conversation</h3>
            <p className="text-sm max-w-xs">
              Choose a call from the list to securely load its raw audio recording and live transcript directly from ElevenLabs.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
