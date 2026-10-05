const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/campaigns/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variable
if (!content.includes('const [audienceToDelete, setAudienceToDelete]')) {
  content = content.replace(
    "const [editingAudienceId, setEditingAudienceId] = useState<string | null>(null);",
    "const [editingAudienceId, setEditingAudienceId] = useState<string | null>(null);\n  const [audienceToDelete, setAudienceToDelete] = useState<string | null>(null);"
  );
}

// 2. Modify handleDeleteAudience and add confirmDeleteAudience
const oldDeleteLogic = `const handleDeleteAudience = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audience group?")) return;
    try {
      const res = await fetch(\`/api/meta/audiences?id=\${id}\`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Audience deleted", "success");
        fetchAudiences();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };`;

const newDeleteLogic = `const handleDeleteAudience = (id: string) => {
    setAudienceToDelete(id);
  };

  const confirmDeleteAudience = async () => {
    if (!audienceToDelete) return;
    try {
      const res = await fetch(\`/api/meta/audiences?id=\${audienceToDelete}\`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Audience deleted", "success");
        if (selectedAudience === audienceToDelete) {
          setSelectedAudience('sandbox');
        }
        fetchAudiences();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setAudienceToDelete(null);
    }
  };`;

if (content.includes('if (!confirm("Are you sure you want to delete this audience group?"))')) {
  content = content.replace(oldDeleteLogic, newDeleteLogic);
}

// 3. Add Delete Modal at the bottom, just before the closing </div> of the main component
const deleteModal = `
      {/* Delete Confirmation Modal */}
      {audienceToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">Delete Audience</h2>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete this audience group? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setAudienceToDelete(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDeleteAudience} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('Delete Confirmation Modal')) {
  content = content.replace(
    "    </div>\n  );\n}",
    deleteModal + "\n    </div>\n  );\n}"
  );
}

fs.writeFileSync(filePath, content);
console.log("Replaced window.confirm with Custom Delete Modal!");
