import { Settings, Key, Bot, ShieldCheck, AlertTriangle } from "lucide-react";

export default async function ConfigPage() {
  const apiKey = "sk_b532b75ffacd5be75f04cd9575c426583ef7f0dc79e51812";
  const agentId = "agent_2901m2hq57c8ezb8m4w77fep25m6";
  
  let agentData = null;
  let error = null;

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: {
        "xi-api-key": apiKey,
      },
      cache: "no-store"
    });
    if (res.ok) {
      agentData = await res.json();
    } else {
      error = `Failed to fetch: ${res.status} ${res.statusText}`;
    }
  } catch (e: any) {
    error = e.message || "Network error";
  }

  // Safe fallback if the data structure is unexpected
  const agentName = agentData?.name || "Mahindra Voice Assistant";
  const firstPrompt = agentData?.conversation_config?.agent?.prompt?.prompt || "No prompt configured.";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Agent Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your ElevenLabs Conversational AI connection and settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/10 p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
              <span>API Connection</span>
              {agentData ? (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-sm flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Error
                </span>
              )}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">ElevenLabs API Key</label>
                <div className="flex relative">
                  <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={apiKey} 
                    readOnly 
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 pl-10 pr-4 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Agent ID</label>
                <div className="flex relative">
                  <Bot className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={agentId} 
                    readOnly 
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 pl-10 pr-4 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Agent Settings */}
          {agentData && (
            <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/10 p-6 rounded-sm shadow-sm">
              <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <span>Live Agent Settings</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 normal-case tracking-normal font-normal">Synced from ElevenLabs</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Agent Name</label>
                  <input 
                    type="text" 
                    value={agentName} 
                    readOnly 
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 px-4 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">System Prompt</label>
                  <textarea 
                    value={firstPrompt} 
                    readOnly 
                    rows={8}
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 px-4 text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-mahindra-red text-white p-6 rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Settings className="w-24 h-24" />
            </div>
            <h3 className="font-bold uppercase tracking-wide mb-2 relative z-10">Configuration Note</h3>
            <p className="text-sm text-white/80 relative z-10 leading-relaxed mb-4">
              Your ElevenLabs agent acts as the conversational brain for this dashboard. 
              Changes to the System Prompt, Voice, and Guardrails should be made directly in the ElevenLabs dashboard.
            </p>
            <a 
              href={`https://elevenlabs.io/app/conversational-ai/${agentId}`} 
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-white text-mahindra-red px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-sm"
            >
              Edit in ElevenLabs
            </a>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm text-red-600 dark:text-red-400 text-sm">
              <strong className="block font-bold mb-1">API Error</strong>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
