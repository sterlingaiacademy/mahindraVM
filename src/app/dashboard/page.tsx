import { Activity, Phone, Calendar, Wrench, Percent, Car, Clock } from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";

export const revalidate = 0; // Disable caching for live data

export default async function DashboardOverview() {
  let totalCalls = 0;
  let showroomVisits = 0;
  let serviceBookings = 0;
  let todaysCalls = 0;
  let conversionRate = "0%";
  let topVehicle = "N/A";
  let isOnline = false;

  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/1EuYUHCElFWq6AgsA-FWFGfnRCxQTOdKG_73725C0fXg/export?format=csv";
    const res = await fetch(csvUrl, { cache: "no-store" });
    
    if (res.ok) {
      isOnline = true;
      const csvText = await res.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      
      const logs = parsed.data;
      totalCalls = logs.length;
      
      const vehicleCounts: Record<string, number> = {};
      const todayString = new Date().toISOString().split('T')[0];

      logs.forEach((log: any) => {
        if (log["Visit Day"] && log["Visit Day"].trim() !== "") showroomVisits++;
        if (log["Service Type"] && log["Service Type"].trim() !== "") serviceBookings++;
        
        if (log["Call Date"] && log["Call Date"].includes(todayString)) todaysCalls++;

        const vehicle = log["Vehicle Model"]?.trim();
        if (vehicle && vehicle !== "-") {
          vehicleCounts[vehicle] = (vehicleCounts[vehicle] || 0) + 1;
        }
      });

      if (totalCalls > 0) {
        conversionRate = Math.round(((showroomVisits + serviceBookings) / totalCalls) * 100) + "%";
      }

      const sortedVehicles = Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1]);
      if (sortedVehicles.length > 0) topVehicle = sortedVehicles[0][0];
    }
  } catch (e) {
    console.error("Failed to fetch live stats", e);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-2 text-gray-900 dark:text-white">Agent Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Live metrics for the Mahindra AI Voice Receptionist.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
        <StatCard title="Total Calls" value={totalCalls} icon={Phone} trend="All time" />
        <StatCard title="Today's Calls" value={todaysCalls} icon={Clock} trend="Last 24h" />
        <StatCard title="Showroom Visits" value={showroomVisits} icon={Calendar} trend="Booked by AI" />
        <StatCard title="Service Leads" value={serviceBookings} icon={Wrench} trend="Captured by AI" />
        <StatCard title="Conversion" value={conversionRate} icon={Percent} trend="Lead Ratio" isGood={parseFloat(conversionRate) > 10} />
        <StatCard title="Top Vehicle" value={topVehicle} icon={Car} trend="Most Enquired" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Agent Info */}
        <div className="bg-white dark:bg-mahindra-black border-gray-200 dark:border-white/10 p-6 rounded-sm shadow-sm">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-white/5 flex justify-between items-center">
            <span>Agent Status</span>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded-sm">Online & Ready</span>
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              The AI Voice Receptionist is currently active and monitoring for outbound triggers.
              All inbound and outbound calls are routing properly through the LiveKit engine.
            </p>
            <div className="p-4 bg-mahindra-dark border border-white/5 rounded-sm">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Notice</h3>
              <p className="text-sm text-gray-300">
                Agent configuration details have been hidden for security. 
                If you need to modify the agent's behavior, please check the configuration settings.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-mahindra-black border-gray-200 dark:border-white/10 p-6 rounded-sm shadow-sm">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-white/5">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link href="/dashboard/outbound" className="block w-full py-3 bg-mahindra-red text-white text-center font-bold uppercase tracking-wider text-sm hover:bg-mahindra-red-dark transition-colors skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">Initiate Outbound Call</span>
            </Link>
            <Link href="/dashboard/transcripts" className="block w-full py-3 bg-white/10 dark:bg-white/5 text-gray-900 dark:text-white text-center font-bold uppercase tracking-wider text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">Review AI Transcripts</span>
            </Link>
            <Link href="/dashboard/logs" className="block w-full py-3 bg-white/10 dark:bg-white/5 text-gray-900 dark:text-white text-center font-bold uppercase tracking-wider text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">View CRM Call Logs</span>
            </Link>
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
