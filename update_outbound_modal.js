const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/outbound/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add History to lucide-react imports
if (!content.includes('History,')) {
    content = content.replace(
        'Play, Download, X, RefreshCw, PhoneOff, Clock, RotateCcw',
        'Play, Download, X, RefreshCw, PhoneOff, Clock, RotateCcw, History, ArrowLeft, Users'
    );
}

// 2. Add state
const stateInjection = `
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryCampaign, setSelectedHistoryCampaign] = useState<any>(null);
`;
if (!content.includes('isHistoryModalOpen')) {
  content = content.replace(
    'const [history, setHistory] = useState<any[]>([]);',
    'const [history, setHistory] = useState<any[]>([]);\n' + stateInjection
  );
}

// 3. Update Header
const oldHeader = `      <header className="mb-10 flex flex-col items-start relative z-10">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Outbound Campaign
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Trigger manual or bulk AI outbound calls via your Voice AI Engine.</p>
      </header>`;

const newHeader = `      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
            Outbound Campaign
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Trigger manual or bulk AI outbound calls via your Voice AI Engine.</p>
        </div>
        <button onClick={() => { setIsHistoryModalOpen(true); setSelectedHistoryCampaign(null); }} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-bold shadow-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
          <History className="w-4 h-4" /> Recent Campaigns
        </button>
      </header>`;

if (content.includes('flex flex-col items-start relative z-10')) {
    content = content.replace(oldHeader, newHeader);
}

// 4. Remove Old Recent Campaigns & Add Modal
const oldHistoryStart = "{/* RECENT CAMPAIGNS */}";
const oldHistoryEndRegex = /\{\/\* RECENT CAMPAIGNS \*\/\}[\s\S]*?\}\)/;

const modalUI = `
      {/* HISTORY MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
              <div className="flex items-center gap-4">
                {selectedHistoryCampaign ? (
                   <button onClick={() => setSelectedHistoryCampaign(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                ) : (
                   <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                     <History className="w-5 h-5" />
                   </div>
                )}
                <div>
                  <h2 className="text-lg font-black uppercase tracking-widest">
                    {selectedHistoryCampaign ? "Campaign Details" : "Recent Campaigns"}
                  </h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {selectedHistoryCampaign ? new Date(selectedHistoryCampaign.startedAt).toLocaleString() : "Your past bulk outbound calls"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black">
              {!selectedHistoryCampaign ? (
                // LIST VIEW
                history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No recent campaigns found.</div>
                ) : (
                  <div className="space-y-3">
                    {history.map((h: any, i: number) => {
                       const completed = h.contacts?.filter((c: any) => c.status === "done").length || 0;
                       const failed = h.contacts?.filter((c: any) => c.status === "failed").length || 0;
                       return (
                         <div 
                           key={i} 
                           onClick={() => setSelectedHistoryCampaign(h)}
                           className="p-5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10 cursor-pointer transition-all group"
                         >
                           <div className="mb-4 md:mb-0">
                             <div className="text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2 group-hover:text-red-600 transition-colors">
                               <CheckCircle2 className="w-4 h-4 text-green-500" />
                               CAMPAIGN COMPLETED
                             </div>
                             <div className="text-xs text-gray-500 dark:text-gray-400">
                               Ran on {new Date(h.startedAt).toLocaleString()}
                             </div>
                           </div>
                           <div className="flex gap-6">
                             <div className="text-center min-w-[60px]">
                               <div className="text-xl font-black">{h.total}</div>
                               <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</div>
                             </div>
                             <div className="text-center min-w-[60px]">
                               <div className="text-xl font-black text-green-500">{completed}</div>
                               <div className="text-[10px] text-green-500/70 font-bold uppercase tracking-widest">Success</div>
                             </div>
                             <div className="text-center min-w-[60px]">
                               <div className="text-xl font-black text-mahindra-red">{failed}</div>
                               <div className="text-[10px] text-mahindra-red/70 font-bold uppercase tracking-widest">Failed</div>
                             </div>
                           </div>
                         </div>
                       );
                    })}
                  </div>
                )
              ) : (
                // DETAILS VIEW
                <div>
                   <div className="mb-6 grid grid-cols-3 gap-4">
                     <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Leads</div>
                        <div className="text-2xl font-black">{selectedHistoryCampaign.total}</div>
                     </div>
                     <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                        <div className="text-[10px] text-green-500 uppercase tracking-widest font-bold mb-1">Success</div>
                        <div className="text-2xl font-black text-green-500">{selectedHistoryCampaign.contacts?.filter((c:any) => c.status === "done").length}</div>
                     </div>
                     <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                        <div className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">Failed</div>
                        <div className="text-2xl font-black text-red-500">{selectedHistoryCampaign.contacts?.filter((c:any) => c.status === "failed").length}</div>
                     </div>
                   </div>

                   <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                     <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 dark:bg-black/50 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-200 dark:border-zinc-800">
                         <tr>
                           <th className="px-6 py-4 font-bold">Contact</th>
                           <th className="px-6 py-4 font-bold">Phone</th>
                           <th className="px-6 py-4 font-bold">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                         {selectedHistoryCampaign.contacts?.map((c: any, idx: number) => {
                           const st = STATUS_BADGE[c.status as keyof typeof STATUS_BADGE] || STATUS_BADGE.queued;
                           return (
                             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                               <td className="px-6 py-4">
                                 <div className="font-bold">{c.name || "Unknown"}</div>
                                 <div className="text-xs text-gray-500">{c.vehicle}</div>
                               </td>
                               <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{c.phone}</td>
                               <td className="px-6 py-4">
                                 <div className="flex flex-col items-start gap-1">
                                    <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider \${st.className}\`}>
                                      {st.icon} {st.label}
                                    </span>
                                    {c.error && <span className="text-[10px] text-red-500 max-w-[200px] truncate" title={c.error}>{c.error}</span>}
                                 </div>
                               </td>
                             </tr>
                           )
                         })}
                       </tbody>
                     </table>
                   </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
`;

// Remove the old recent campaigns and add the modal
content = content.replace(oldHistoryEndRegex, "");
content = content.replace(/\{\/\* RECENT CAMPAIGNS \*\/\}[\s\S]*?\}\)/, ""); // double check

if (!content.includes('HISTORY MODAL')) {
  content = content.replace(
    '    </div>\n  );\n}',
    modalUI + '\n    </div>\n  );\n}'
  );
}

fs.writeFileSync(filePath, content);
console.log("Updated Outbound page with Modal!");
