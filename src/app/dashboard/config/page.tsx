import { Settings, User, Lock, Bot, ShieldCheck } from "lucide-react";

export default function ConfigPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Agent Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your system settings and account access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dashboard Credentials Settings */}
          <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/10 p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-mahindra-red" />
              <span>Account Settings</span>
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">New Username</label>
                <div className="flex relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Enter new username"
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-mahindra-red/50 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">New Password</label>
                <div className="flex relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-mahindra-red/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Confirm New Password</label>
                <div className="flex relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-mahindra-red/50 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="button" className="px-6 py-2 bg-mahindra-red text-white text-xs font-bold uppercase tracking-wider hover:bg-mahindra-red-dark transition-colors rounded-sm skew-x-[-10deg]">
                  <span className="block skew-x-[10deg]">Update Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {/* Agent Settings Note */}
          <div className="bg-mahindra-dark border border-white/5 text-white p-6 rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot className="w-24 h-24" />
            </div>
            <h3 className="text-mahindra-red font-bold uppercase tracking-wide mb-2 relative z-10 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Agent Configuration
            </h3>
            <p className="text-sm text-gray-300 relative z-10 leading-relaxed">
              If you need to edit the agent's behavior, instructions, or voice settings, please contact the developers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
