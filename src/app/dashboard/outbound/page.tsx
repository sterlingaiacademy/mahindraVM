"use client";

import { useState, useRef } from "react";
import { PhoneOutgoing, Loader2, CheckCircle2, AlertCircle, FileUp, Play, Download, X } from "lucide-react";
import Papa from "papaparse";

export default function OutboundTriggerPage() {
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [context, setContext] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Bulk State
  const [bulkList, setBulkList] = useState<any[]>([]);
  const [bulkStatus, setBulkStatus] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerCall = async (phoneNumber: string, contextData: any = {}) => {
    try {
      const res = await fetch("/api/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          agent_id: "agent_2901m2hq57c8ezb8m4w77fep25m6",
          dynamic_variables: contextData
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.error || "Failed to trigger call" };
      }
      
      const data = await res.json();
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const handleSingleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setStatus("loading");
    setMessage("");
    
    const result = await triggerCall(phone, { 
      customer_name: customerName,
      vehicle: vehicleName,
      context: context 
    });
    if (result.success) {
      setStatus("success");
      setMessage(`Outbound call triggered successfully to ${phone}.`);
      setPhone("");
      setCustomerName("");
      setVehicleName("");
      setContext("");
      setTimeout(() => setStatus("idle"), 5000);
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setBulkList(results.data);
        setBulkStatus("idle");
        setProgress(0);
      }
    });
  };

  const startBulkCampaign = async () => {
    if (bulkList.length === 0) return;
    
    setBulkStatus("running");
    
    try {
      const res = await fetch("/api/outbound/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: bulkList })
      });
      
      if (!res.ok) throw new Error("Failed to start campaign");
      
      // Because the server handles the looping now, we can instantly mark it as done locally
      // (or we can show a special "Running in background" state)
      setBulkStatus("done");
      
    } catch (e) {
      console.error("Campaign failed to start:", e);
      setBulkStatus("idle");
    }
  };

  const downloadTemplate = () => {
    const template = "phone,customer_name,vehicle,context\n+919876543210,Rahul Menon,XUV700,Service Reminder for 10 AM tomorrow\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "campaign_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-2 text-gray-900 dark:text-white">Outbound Campaign</h1>
        <p className="text-gray-500 dark:text-gray-400">Trigger manual or bulk AI outbound calls via your integrated SIP Trunk.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Manual Trigger Form */}
        <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/10 p-6 rounded-sm shadow-sm">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
            Single Call Trigger
          </h2>
          
          <form onSubmit={handleSingleTrigger} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Customer Phone Number</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210" 
                className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors font-mono dark:text-white text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Menon" 
                  className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors dark:text-white text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Vehicle Model</label>
                <input 
                  type="text" 
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="e.g. XUV700" 
                  className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors dark:text-white text-gray-900"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Call Context (Optional)</label>
              <textarea 
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g., Remind the customer about their scheduled XUV700 test drive tomorrow at 10 AM." 
                className="w-full bg-gray-50 dark:bg-mahindra-dark border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors resize-none dark:text-white text-gray-900"
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full py-4 bg-mahindra-red text-white font-bold uppercase tracking-wider text-sm hover:bg-mahindra-red-dark transition-colors skew-x-[-10deg] flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:bg-mahindra-red"
            >
              <span className="block skew-x-[10deg] flex items-center gap-2">
                {status === 'loading' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Initiating...</>
                ) : (
                  <><PhoneOutgoing className="w-5 h-5" /> Trigger AI Call</>
                )}
              </span>
            </button>
            
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

        {/* List Uploader & Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/10 p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-100 dark:border-white/5 text-gray-900 dark:text-white flex items-center justify-between">
              <span>Bulk Campaign</span>
              {bulkList.length > 0 && <span className="text-xs bg-mahindra-red text-white px-2 py-1 rounded-sm">{bulkList.length} Rows loaded</span>}
            </h2>
            
            {bulkList.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-white/10 p-8 text-center hover:border-mahindra-red dark:hover:border-mahindra-red/50 transition-colors cursor-pointer group rounded-sm bg-gray-50 dark:bg-transparent"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 mx-auto mb-4 flex items-center justify-center rounded-full group-hover:bg-mahindra-red/10 transition-colors">
                  <FileUp className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-mahindra-red" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload CSV list</p>
                <p className="text-xs text-gray-500">Columns: phone, customer_name, vehicle_name, context</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-white/10 rounded-sm bg-gray-50 dark:bg-mahindra-dark flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{bulkList.length} Contacts Ready</h3>
                  <button 
                    onClick={() => {setBulkList([]); setBulkStatus("idle"); setProgress(0);}}
                    className="text-xs font-bold uppercase text-gray-500 hover:text-mahindra-red transition-colors"
                    disabled={bulkStatus === "running"}
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="max-h-60 overflow-y-auto p-2">
                  <ul className="space-y-2">
                    {bulkList.map((row, index) => {
                      const phone = row.phone || row.Phone || row.PHONE || row.phone_number || row.Phone_Number || "Unknown";
                      const name = row.customer_name || row.name || row.Name || row.CUSTOMER_NAME || "Unknown";
                      
                      return (
                        <li key={index} className="flex items-center justify-between p-3 bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/5 rounded-sm">
                          <div className="flex flex-col text-left overflow-hidden pr-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {name !== "Unknown" ? name : phone}
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 font-mono">
                              <span>{phone}</span>
                              { (row.vehicle || row.vehicle_name) && (
                                <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-[10px]">
                                  🚗 {row.vehicle || row.vehicle_name}
                                </span>
                              )}
                              {row.context && (
                                <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-[10px] truncate max-w-[150px]">
                                  📝 {row.context}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="shrink-0 flex items-center">
                            {bulkStatus === "idle" && (
                              <button 
                                onClick={() => setBulkList(prev => prev.filter((_, i) => i !== index))}
                                className="p-2 text-gray-400 hover:text-mahindra-red hover:bg-mahindra-red/10 rounded-sm transition-colors"
                                title="Remove contact"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            {bulkStatus === "done" && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            {bulkStatus === "running" && (
                              <Loader2 className="w-4 h-4 text-mahindra-red animate-spin" />
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-white/10">
                  {bulkStatus === "running" && (
                    <div className="p-3 bg-gray-100 dark:bg-white/5 text-gray-500 text-sm font-bold flex items-center justify-center gap-2 rounded-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Dispatching to Server...
                    </div>
                  )}
                  
                  {bulkStatus === "idle" && (
                    <button 
                      onClick={startBulkCampaign}
                      className="w-full py-3 bg-mahindra-red text-white font-bold uppercase tracking-wider text-xs hover:bg-[#cc0000] transition-colors flex justify-center items-center gap-2 shadow-md rounded-sm"
                    >
                      <Play className="w-4 h-4 fill-current" /> Start Background Campaign
                    </button>
                  )}
                  
                  {bulkStatus === "done" && (
                    <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-sm">
                      <div className="text-green-700 dark:text-green-400 text-sm font-bold flex items-center justify-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4" /> Dispatched Successfully
                      </div>
                      <p className="text-xs text-center text-green-600/80 dark:text-green-400/80">
                        The server is now handling the 1-second delay loop in the background. You can safely close this tab or log out.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button 
              onClick={downloadTemplate}
              className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-xs border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors rounded-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Template
            </button>
          </div>

          <div className="bg-mahindra-red/5 border border-mahindra-red/20 p-6 rounded-sm">
             <h3 className="text-sm font-bold uppercase tracking-wide text-mahindra-red flex items-center gap-2 mb-2">
               <AlertCircle className="w-4 h-4" /> Native API Integration
             </h3>
             <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
               The outbound trigger is now directly wired to the Node.js backend using the LiveKit SDK. It will create rooms and automatically dispatch AI agents for each call in the background.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
