export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-mahindra-red border-t-transparent animate-spin"></div>
      </div>
      <div className="text-gray-500 dark:text-gray-400 font-medium tracking-wide animate-pulse uppercase text-sm">
        Syncing live data...
      </div>
    </div>
  );
}
