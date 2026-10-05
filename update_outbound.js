const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/outbound/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state
const stateInjection = `
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/outbound/history");
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch(e) {}
  }, []);

  const handleClearCampaign = async () => {
    try {
      await fetch("/api/outbound/status", { method: "DELETE" });
      setCampaign(null);
      fetchHistory();
    } catch(e) {}
  };
`;

if (!content.includes('const fetchHistory = useCallback')) {
  content = content.replace(
    'const [singleMessage, setSingleMessage] = useState("");',
    'const [singleMessage, setSingleMessage] = useState("");\n' + stateInjection
  );
}

// 2. Add fetchHistory to useEffect
const oldUseEffect = `
  // On mount: check if a campaign is already running (e.g., page reload mid-campaign)
  useEffect(() => {
    pollStatus();
  }, [pollStatus]);
`;
const newUseEffect = `
  // On mount: check if a campaign is already running (e.g., page reload mid-campaign)
  useEffect(() => {
    pollStatus();
    fetchHistory();
  }, [pollStatus, fetchHistory]);
`;
if (content.includes(oldUseEffect)) {
  content = content.replace(oldUseEffect, newUseEffect);
} else {
    // try fallback replacement
    content = content.replace(
        "pollStatus();\n  }, [pollStatus]);",
        "pollStatus();\n    fetchHistory();\n  }, [pollStatus, fetchHistory]);"
    );
}

// 3. Update the New Campaign button onClick
content = content.replace(
  'onClick={() => { setCampaign(null); }}',
  'onClick={handleClearCampaign}'
);

// 4. Inject "RECENT CAMPAIGNS" at the bottom
const historyUI = `
      {/* RECENT CAMPAIGNS */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Recent Campaigns</h2>
          <div className="space-y-4">
            {history.map((h: any, i: number) => {
               const completed = h.contacts.filter((c: any) => c.status === "done").length;
               const failed = h.contacts.filter((c: any) => c.status === "failed").length;
               return (
                 <div key={i} className="p-4 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-black flex items-center justify-between shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                   <div>
                     <div className="text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-green-500" />
                       CAMPAIGN COMPLETED
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400">
                       Ran on {new Date(h.startedAt).toLocaleString()}
                     </div>
                   </div>
                   <div className="flex gap-4">
                     <div className="text-center">
                       <div className="text-lg font-bold">{h.total}</div>
                       <div className="text-[10px] text-gray-400 uppercase tracking-widest">Total</div>
                     </div>
                     <div className="text-center">
                       <div className="text-lg font-bold text-green-500">{completed}</div>
                       <div className="text-[10px] text-green-500/70 uppercase tracking-widest">Success</div>
                     </div>
                     <div className="text-center">
                       <div className="text-lg font-bold text-mahindra-red">{failed}</div>
                       <div className="text-[10px] text-mahindra-red/70 uppercase tracking-widest">Failed</div>
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}
`;
if (!content.includes('Recent Campaigns')) {
  content = content.replace(
    '    </div>\n  );\n}',
    historyUI + '\n    </div>\n  );\n}'
  );
}

fs.writeFileSync(filePath, content);
console.log("Updated Outbound page!");
