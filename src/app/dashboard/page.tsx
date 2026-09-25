import { Activity, Phone, Calendar, Wrench, Percent, Car, Clock } from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";
import { LeadSourceChart, LeadStatusChart } from "@/components/DashboardCharts";
import { UpcomingEventsBoard } from "@/components/UpcomingEventsBoard";

export const revalidate = 0; // Disable caching for live data

export default async function DashboardOverview() {
  let totalCalls = 0;
  let showroomVisits = 0;
  let serviceBookings = 0;
  let todaysCalls = 0;
  let conversionRate = "0%";
  let topVehicle = "N/A";
  let isOnline = false;
  let logs: any[] = [];

  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/1EuYUHCElFWq6AgsA-FWFGfnRCxQTOdKG_73725C0fXg/export?format=csv";
    const res = await fetch(csvUrl, { cache: "no-store" });
    
    if (res.ok) {
      isOnline = true;
      const csvText = await res.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      
      logs = parsed.data;
      totalCalls = logs.length;
      
      const vehicleCounts: Record<string, number> = {};
      const todayString = new Date().toISOString().split('T')[0];

      logs.forEach((log: any) => {
        const hasVisit = log["Visit Day"] && log["Visit Day"].trim() !== "";
        const hasService = log["Service Type"] && log["Service Type"].trim() !== "";
        
        if (hasVisit) showroomVisits++;
        else if (hasService) serviceBookings++;
        
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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen bg-[#F8F9FA] dark:bg-black">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
            Analytics Hub
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">Live insights powered by your proprietary AI Voice Engine.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link href="/dashboard/pipeline" className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 md:px-5 py-3 md:py-2.5 bg-mahindra-red text-white hover:bg-mahindra-red-dark transition-colors rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-mahindra-red/40 hover:-translate-y-0.5 transform duration-300">
            Pipeline
          </Link>
          <Link href="/dashboard/outbound" className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 md:px-5 py-3 md:py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-300">
            New Call
          </Link>
          
          <div className="flex-1 md:flex-none justify-center flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-3 md:py-2.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-md">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard title="Total Leads" value={totalCalls} icon={Phone} trend="All time" delay="0" />
        <StatCard title="Today's Leads" value={todaysCalls} icon={Clock} trend="Last 24h" delay="75" />
        <StatCard title="Showroom Visits" value={showroomVisits} icon={Calendar} trend="Booked by AI" delay="150" />
        <StatCard title="Service Leads" value={serviceBookings} icon={Wrench} trend="Captured by AI" delay="225" />
        <StatCard title="Conversion" value={conversionRate} icon={Percent} trend="Lead Ratio" isGood={parseFloat(conversionRate) > 10} delay="300" />
        <StatCard title="Top Vehicle" value={topVehicle} icon={Car} trend="Most Enquired" delay="375" />
      </div>

      {/* Notice Board Section */}
      <div className="mb-10 transform transition-all duration-500 hover:shadow-2xl rounded-3xl">
        <UpcomingEventsBoard data={logs} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="group bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mahindra-red/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
          <h2 className="text-lg font-bold uppercase tracking-widest mb-8 text-gray-800 dark:text-gray-200 relative z-10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-mahindra-red"></span>
            Vehicle Enquiries
          </h2>
          <div className="relative z-10">
            {logs.length > 0 ? <LeadSourceChart data={logs} /> : <EmptyChart />}
          </div>
        </div>

        <div className="group bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
          <h2 className="text-lg font-bold uppercase tracking-widest mb-8 text-gray-800 dark:text-gray-200 relative z-10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Lead Status Distribution
          </h2>
          <div className="relative z-10">
            {logs.length > 0 ? <LeadStatusChart data={logs} /> : <EmptyChart />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isGood = false, delay = "0" }: any) {
  return (
    <div 
      className="group relative bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-3xl hover:border-mahindra-red/30 dark:hover:border-mahindra-red/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-default"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-mahindra-red/0 to-mahindra-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-mahindra-red/10 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-4 h-4 text-gray-400 group-hover:text-mahindra-red transition-colors" />
        </div>
      </div>
      
      <div className="text-4xl font-black tracking-tighter mb-2 text-gray-900 dark:text-white relative z-10">
        {value}
      </div>
      
      <div className={`text-[10px] font-bold uppercase tracking-widest relative z-10 flex items-center gap-1.5 ${isGood ? 'text-green-500' : 'text-gray-400'}`}>
        {trend}
      </div>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4">
    <div className="w-16 h-16 border-4 border-dashed border-gray-200 dark:border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
    <span className="text-xs font-bold uppercase tracking-widest">Awaiting Data</span>
  </div>;
}
