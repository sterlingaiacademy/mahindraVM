const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/config/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports if missing
if (!content.includes('useEffect')) {
  content = content.replace('import { useState }', 'import { useState, useEffect }');
}

// 2. Add state and fetch logic
const stateInsertion = `  const [metaAppId, setMetaAppId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");
  const [metaStatus, setMetaStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [metaMessage, setMetaMessage] = useState("");

  useEffect(() => {
    fetch('/api/credentials/meta')
      .then(r => r.json())
      .then(data => {
        if (data.metaAppId) setMetaAppId(data.metaAppId);
        if (data.hasAppSecret) setMetaAppSecret("********");
      })
      .catch(() => {});
  }, []);

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaStatus("loading");
    
    try {
      const payload: any = { metaAppId };
      if (metaAppSecret && metaAppSecret !== "********") {
        payload.metaAppSecret = metaAppSecret;
      }

      const res = await fetch("/api/credentials/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setMetaStatus("success");
        setMetaMessage("Meta API credentials saved successfully!");
        setTimeout(() => setMetaStatus("idle"), 5000);
      } else {
        setMetaStatus("error");
        setMetaMessage("Failed to update Meta credentials.");
      }
    } catch (e: any) {
      setMetaStatus("error");
      setMetaMessage("Network error occurred.");
    }
  };

  const handleUpdate = async`;

if (!content.includes('setMetaAppId')) {
  content = content.replace('const handleUpdate = async', stateInsertion);
}

// 3. Add the UI block right after the Admin Credentials closing tag
const uiInsertion = `          {/* Meta API Settings */}
          <div className="group bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden mt-8">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-gray-800 dark:text-gray-200 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-blue-600"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </div>
              <span>Meta App Settings</span>
            </h2>
            <form onSubmit={handleUpdateMeta} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">App ID</label>
                <input 
                  type="text" 
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                  placeholder="e.g. 1405743091375589"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">App Secret</label>
                <input 
                  type="password" 
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                  placeholder="Enter App Secret"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono"
                />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={metaStatus === 'loading'} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-sm transition-all duration-300 flex justify-center items-center gap-3 rounded-2xl shadow-lg hover:shadow-blue-600/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50">
                  {metaStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Meta Credentials"}
                </button>
              </div>
              {metaStatus === 'success' && <div className="p-4 rounded-xl text-sm font-medium bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-500/20 flex items-start gap-3 mt-4"><CheckCircle2 className="w-5 h-5 shrink-0" /><p>{metaMessage}</p></div>}
              {metaStatus === 'error' && <div className="p-4 rounded-xl text-sm font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 flex items-start gap-3 mt-4"><AlertCircle className="w-5 h-5 shrink-0" /><p>{metaMessage}</p></div>}
            </form>
          </div>
        </div>

        <div className="space-y-8 animate-fade-up" style={{ animationDelay: '200ms' }}>`;

if (!content.includes('Meta API Settings')) {
  content = content.replace(`        </div>\n\n        <div className="space-y-8 animate-fade-up" style={{ animationDelay: '200ms' }}>`, uiInsertion);
}

fs.writeFileSync(filePath, content);
console.log("Config updated successfully!");
