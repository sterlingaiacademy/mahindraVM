"use client";

import { useState } from "react";
import { Settings, User, Lock, Bot, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ConfigPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setStatus("error");
      setMessage("Username and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("Credentials updated successfully! You can now use these to log in.");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to update credentials.");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message || "Network error occurred.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Account Configuration</h1>
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

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">New Username</label>
                <div className="flex relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-mahindra-red/50 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="px-6 py-2 bg-mahindra-red text-white text-xs font-bold uppercase tracking-wider hover:bg-mahindra-red-dark transition-colors rounded-sm skew-x-[-10deg] disabled:opacity-50 disabled:hover:bg-mahindra-red flex items-center"
                >
                  <span className="block skew-x-[10deg] flex items-center gap-2">
                    {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />} 
                    Update Credentials
                  </span>
                </button>
              </div>
              
              {status === 'success' && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-start gap-3 mt-4">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p>{message}</p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-mahindra-red/10 border border-red-200 dark:border-mahindra-red/20 text-red-700 dark:text-mahindra-red text-sm flex items-start gap-3 mt-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{message}</p>
                </div>
              )}
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
