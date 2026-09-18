import { Activity, Phone, Clock, Users } from "lucide-react";

export const revalidate = 0; // Disable caching for live data

export default async function DashboardOverview() {
  const agentId = "agent_2901m2hq57c8ezb8m4w77fep25m6";
  const apiKey = "sk_b532b75ffacd5be75f04cd9575c426583ef7f0dc79e51812";
  
  let agentData = null;
  let error = null;
  
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: {
        "xi-api-key": apiKey
      },
      next: { revalidate: 0 }
    });
    
    if (res.ok) {
      agentData = await res.json();
    } else {
      error = "Failed to fetch agent data. Status: " + res.status;
    }
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">Agent Overview</h1>
        <p className="text-gray-400">Live metrics for the Mahindra AI Voice Receptionist.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Calls" value="1,248" icon={Phone} trend="+12% this week" />
        <StatCard title="Avg Duration" value="2m 14s" icon={Clock} trend="-5s this week" />
        <StatCard title="Leads Captured" value="342" icon={Users} trend="+18% this week" />
        <StatCard title="System Status" value="Active" icon={Activity} trend="99.9% uptime" isGood />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Config (from 11labs) */}
        <div className="lg:col-span-2 bg-white dark:bg-mahindra-black border-gray-200 dark:border-white/10 p-6 rounded-sm">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-white/5 flex justify-between items-center">
            <span>ElevenLabs Connection</span>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded-sm">Online</span>
          </h2>
          
          {error ? (
            <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-sm">
              Error fetching ElevenLabs data: {error}
            </div>
          ) : agentData ? (
            <div className="space-y-4">
              <ConfigRow label="Agent Name" value={agentData.name || "N/A"} />
              <ConfigRow label="Agent ID" value={agentData.agent_id} />
              <ConfigRow label="Voice ID" value={agentData.conversation_config?.tts?.voice_id || "N/A"} />
              <ConfigRow label="Language" value={agentData.conversation_config?.agent?.language || "en"} />
              
              <div className="mt-6 p-4 bg-mahindra-dark border border-white/5">
                <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">System Prompt Preview</h3>
                <p className="text-sm text-gray-300 line-clamp-4 font-mono">
                  {agentData.conversation_config?.agent?.prompt?.prompt || "No prompt configured."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">Loading agent data...</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-mahindra-black border-gray-200 dark:border-white/10 p-6 rounded-sm">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-white/5">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <button className="w-full py-3 bg-mahindra-red text-white font-bold uppercase tracking-wider text-sm hover:bg-mahindra-red-dark transition-colors skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">Initiate Outbound Call</span>
            </button>
            <button className="w-full py-3 bg-white/5 text-white font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">Sync Call Logs</span>
            </button>
            <button className="w-full py-3 bg-white/5 text-white font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">Edit Instructions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isGood = false }: any) {
  return (
    <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/5 p-6 rounded-sm hover:border-gray-300 dark:hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">{title}</h3>
        <Icon className="w-5 h-5 text-mahindra-red" />
      </div>
      <div className="text-3xl font-bold tracking-tighter mb-2">{value}</div>
      <div className={`text-xs ${isGood ? 'text-green-500' : 'text-gray-500'}`}>{trend}</div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-mono text-white">{value}</span>
    </div>
  );
}
