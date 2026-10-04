const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/config/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the state variables and useEffect
const oldStateBlockRegex = /const \[metaAppId.*?const handleUpdateMeta.*?}/s;
if (content.match(oldStateBlockRegex)) {
  const newStateBlock = `  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [sysStatus, setSysStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sysMessage, setSysMessage] = useState("");

  useEffect(() => {
    fetch('/api/credentials/system')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setConfigValues(data);
      })
      .catch(() => {});
  }, []);

  const handleConfigChange = (key: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSysStatus("loading");
    
    try {
      const res = await fetch("/api/credentials/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configValues)
      });
      
      if (res.ok) {
        setSysStatus("success");
        setSysMessage("System Integrations saved successfully!");
        setTimeout(() => setSysStatus("idle"), 5000);
      } else {
        setSysStatus("error");
        setSysMessage("Failed to update system config.");
      }
    } catch (e: any) {
      setSysStatus("error");
      setSysMessage("Network error occurred.");
    }
  }`;
  content = content.replace(oldStateBlockRegex, newStateBlock);
}

// Replace the UI block for Meta App Settings with a generic Integrations block
const oldUiBlockRegex = /\{\/\* Meta API Settings \*\/}.*?<\/form>\s*<\/div>/s;
if (content.match(oldUiBlockRegex)) {
  const newUiBlock = `{/* System API & Integrations Settings */}
          <div className="group bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden mt-8">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-gray-800 dark:text-gray-200 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-blue-600"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </div>
              <span>Platform Integrations</span>
            </h2>
            <form onSubmit={handleUpdateSystem} className="space-y-6 relative z-10">
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Meta (WhatsApp & Instagram)</h4>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">App ID</label>
                  <input type="text" value={configValues.META_APP_ID || ''} onChange={(e) => handleConfigChange('META_APP_ID', e.target.value)} placeholder="e.g. 1405743091375589" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">App Secret</label>
                  <input type="password" value={configValues.META_APP_SECRET || ''} onChange={(e) => handleConfigChange('META_APP_SECRET', e.target.value)} placeholder="Enter App Secret" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">WhatsApp Phone Number ID</label>
                  <input type="text" value={configValues.META_PHONE_NUMBER_ID || ''} onChange={(e) => handleConfigChange('META_PHONE_NUMBER_ID', e.target.value)} placeholder="e.g. 112233445566778" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono" />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">ElevenLabs AI Voice</h4>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">API Key</label>
                  <input type="password" value={configValues.ELEVENLABS_API_KEY || ''} onChange={(e) => handleConfigChange('ELEVENLABS_API_KEY', e.target.value)} placeholder="sk_..." className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mahindra-red/50 focus:border-mahindra-red transition-all duration-300 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">Agent ID</label>
                  <input type="text" value={configValues.ELEVENLABS_AGENT_ID || ''} onChange={(e) => handleConfigChange('ELEVENLABS_AGENT_ID', e.target.value)} placeholder="e.g. XyZ123..." className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mahindra-red/50 focus:border-mahindra-red transition-all duration-300 font-mono" />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Internal Engine</h4>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">Voice Engine (Python URL)</label>
                  <input type="text" value={configValues.PYTHON_SERVER_URL || ''} onChange={(e) => handleConfigChange('PYTHON_SERVER_URL', e.target.value)} placeholder="http://localhost:8080/outbound" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400 transition-all duration-300 font-mono" />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={sysStatus === 'loading'} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-sm transition-all duration-300 flex justify-center items-center gap-3 rounded-2xl shadow-lg hover:shadow-blue-600/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50">
                  {sysStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save All Integrations"}
                </button>
              </div>
              {sysStatus === 'success' && <div className="p-4 rounded-xl text-sm font-medium bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-500/20 flex items-start gap-3 mt-4"><CheckCircle2 className="w-5 h-5 shrink-0" /><p>{sysMessage}</p></div>}
              {sysStatus === 'error' && <div className="p-4 rounded-xl text-sm font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 flex items-start gap-3 mt-4"><AlertCircle className="w-5 h-5 shrink-0" /><p>{sysMessage}</p></div>}
            </form>
          </div>`;
  content = content.replace(oldUiBlockRegex, newUiBlock);
}

fs.writeFileSync(filePath, content);
console.log("Config Page upgraded to full SaaS integrations page!");
