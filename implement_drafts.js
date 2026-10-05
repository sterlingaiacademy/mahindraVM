const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/campaigns/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Image upload to Base64
content = content.replace(
  "const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {\n      const file = e.target.files?.[0];\n      if (file) setImageBlob(URL.createObjectURL(file));\n    };",
  `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) setImageBlob(ev.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    };`
);

// 2. Add Draft State and Functions right after `const [leads, setLeads] = useState<any[]>([]);`
const draftState = `
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/meta/campaign/drafts');
      if (res.ok) {
        const data = await res.json();
        setSavedDrafts(data.drafts);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleSaveDraft = async () => {
    const payload = {
      id: currentDraftId,
      platform,
      adBody,
      adFooter,
      buttonText,
      buttonUrl,
      igCaption,
      imageBlob
    };
    try {
      const res = await fetch('/api/meta/campaign/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Draft saved successfully!", "success");
        setCurrentDraftId(data.draft.id);
        fetchDrafts();
      }
    } catch (e) {
      showToast("Failed to save draft", "error");
    }
  };

  const loadDraft = (draft: any) => {
    setPlatform(draft.platform || 'whatsapp');
    setAdBody(draft.adBody || "");
    setAdFooter(draft.adFooter || "");
    setButtonText(draft.buttonText || "Book Test Drive");
    setButtonUrl(draft.buttonUrl || "https://mahindra.com/test-drive");
    setIgCaption(draft.igCaption || "");
    setImageBlob(draft.imageBlob || null);
    setCurrentDraftId(draft.id);
    setActiveTab('CREATE');
  };

  const deleteDraft = async (id: string) => {
    try {
      const res = await fetch(\`/api/meta/campaign/drafts?id=\${id}\`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Draft deleted", "success");
        if (currentDraftId === id) setCurrentDraftId(null);
        fetchDrafts();
      }
    } catch (e) {}
  };
`;
if (!content.includes('const fetchDrafts = async () => {')) {
  content = content.replace("const [leads, setLeads] = useState<any[]>([]);", "const [leads, setLeads] = useState<any[]>([]);\n" + draftState);
}

// 3. Update Save Draft Button
content = content.replace(
  "<button className=\"flex-1 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-white py-3.5 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors\">Save Draft</button>",
  "<button onClick={handleSaveDraft} className=\"flex-1 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-white py-3.5 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors\">Save Draft</button>"
);

// 4. Add Tab Button
const oldLeadsTab = `<button onClick={() => setActiveTab('LEADS')} className={\`pb-4 text-sm font-bold tracking-wider flex items-center gap-2 \${activeTab === 'LEADS' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors'}\`}>\n            FETCHED LEADS <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">NEW</span>\n          </button>`;
const draftsTab = `\n          <button onClick={() => setActiveTab('DRAFTS')} className={\`pb-4 text-sm font-bold tracking-wider \${activeTab === 'DRAFTS' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors'}\`}>SAVED DRAFTS</button>`;
if (!content.includes('SAVED DRAFTS')) {
  content = content.replace(oldLeadsTab, oldLeadsTab + draftsTab);
}

// 5. Add Drafts View UI at the bottom
const draftsView = `
      {activeTab === 'DRAFTS' && (
        <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Saved Campaigns</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Manage your saved ad templates and drafts.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDrafts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 dark:text-zinc-500">
                No saved drafts yet. Create an ad and click "Save Draft".
              </div>
            ) : (
              savedDrafts.map(draft => (
                <div key={draft.id} className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black rounded-xl overflow-hidden group">
                  {draft.imageBlob ? (
                    <img src={draft.imageBlob} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 dark:bg-zinc-900 flex items-center justify-center"><FileImage className="w-8 h-8 text-gray-300 dark:text-zinc-700" /></div>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">{draft.platform}</span>
                    <p className="mt-3 text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{draft.platform === 'whatsapp' ? draft.adBody : draft.igCaption}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => loadDraft(draft)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold rounded transition-colors">Edit & Push</button>
                      <button onClick={() => deleteDraft(draft.id)} className="px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
`;
if (!content.includes('Saved Campaigns')) {
  content = content.replace("{activeTab === 'LEADS' && (", draftsView + "\n      {activeTab === 'LEADS' && (");
}

fs.writeFileSync(filePath, content);
console.log("Drafts feature implemented!");
