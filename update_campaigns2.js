const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/campaigns/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add PapaParse import
if (!content.includes("import Papa")) {
  content = content.replace("import { useState", "import Papa from 'papaparse';\nimport { useState");
}
if (!content.includes("UploadCloud")) {
  content = content.replace("import { Share2, FileImage, ", "import { Share2, FileImage, UploadCloud, ");
}

// Add handleCsvUpload function
const csvHandler = `
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      complete: (results) => {
        const text = results.data.flat().join(' ');
        const matches = text.match(/\\d{10,15}/g) || [];
        if (matches.length > 0) {
          setNewAudienceNumbers(prev => prev + (prev ? '\\n' : '') + matches.join('\\n'));
          setToast({ message: \`Extracted \${matches.length} numbers from file!\`, type: 'success' });
        } else {
          setToast({ message: 'No valid phone numbers found in file.', type: 'error' });
        }
      }
    });
  };
`;

if (!content.includes("handleCsvUpload")) {
  content = content.replace("const handleSaveAudience = async () => {", csvHandler + "\n  const handleSaveAudience = async () => {");
}

// Replace Modal
const modalRegex = /\{\/\*\s*AUDIENCE MODAL\s*\*\/\}.*?isAudienceModalOpen && \(\s*<div className="fixed inset-0.*?<\/div>\s*\)\}/s;

const newModal = `{/* AUDIENCE MODAL */}
        {isAudienceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="bg-white dark:bg-black w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{editingAudienceId ? 'Edit Audience' : 'Create New Audience'}</h3>
                <button onClick={() => setIsAudienceModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Audience Name</label>
                  <input value={newAudienceName} onChange={e => setNewAudienceName(e.target.value)} placeholder="e.g. October Leads" className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg p-3 outline-none focus:border-red-600 transition-colors" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-gray-500 block uppercase tracking-wider">Phone Numbers</label>
                    <label className="cursor-pointer text-xs font-bold text-red-600 hover:text-red-500 flex items-center gap-1.5 transition-colors bg-red-600/10 px-3 py-1.5 rounded-full">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload CSV
                      <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={handleCsvUpload} />
                    </label>
                  </div>
                  <textarea value={newAudienceNumbers} onChange={e => setNewAudienceNumbers(e.target.value)} rows={6} placeholder="919876543210&#10;918765432109" className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg p-3 outline-none focus:border-red-600 transition-colors font-mono text-sm" />
                </div>
                <button onClick={handleSaveAudience} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-red-900/20">
                  {editingAudienceId ? 'Save Changes' : 'Create Audience'}
                </button>
              </div>
            </div>
          </div>
        )}`;

content = content.replace(modalRegex, newModal);

// Replace Toggles
const toggleRegex = /<div className="flex bg-gray-100 dark:bg-zinc-900\/50 p-1 rounded-xl mb-8 border border-gray-200 dark:border-zinc-800">.*?<\/div>/s;

const newToggles = `<div className="flex bg-gray-100 dark:bg-zinc-900/50 p-1 rounded-xl mb-8 border border-gray-200 dark:border-zinc-800">
            <button onClick={() => setPlatform('whatsapp')} className={\`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 \${platform === 'whatsapp' ? 'bg-white dark:bg-zinc-800 text-[#25D366] shadow-sm border border-gray-200 dark:border-zinc-700' : 'text-gray-500 hover:text-[#25D366]'}\`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp Broadcast
            </button>
            <button onClick={() => setPlatform('instagram')} className={\`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 \${platform === 'instagram' ? 'bg-white dark:bg-zinc-800 text-[#E1306C] shadow-sm border border-gray-200 dark:border-zinc-700' : 'text-gray-500 hover:text-[#E1306C]'}\`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              Instagram Post
            </button>
          </div>`;

content = content.replace(toggleRegex, newToggles);

fs.writeFileSync(filePath, content);
console.log("Replaced using regex!");
