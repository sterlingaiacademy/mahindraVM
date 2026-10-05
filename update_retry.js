const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/outbound/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add inlineStatus state and handleInlineRetry function
const inlineStateCode = `
  const [inlineStatus, setInlineStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const handleInlineRetry = async (contact: any) => {
    setInlineStatus(prev => ({ ...prev, [contact.phone]: 'loading' }));
    const result = await triggerCall(contact.phone, { customer_name: contact.name, vehicle: contact.vehicle, context: contact.context || "", phone: contact.phone });
    
    if (result.success) {
      setInlineStatus(prev => ({ ...prev, [contact.phone]: 'success' }));
      if (selectedHistoryCampaign) {
        const updatedContacts = selectedHistoryCampaign.contacts.map((c: any) => c.phone === contact.phone ? { ...c, status: 'done', error: undefined } : c);
        setSelectedHistoryCampaign({ ...selectedHistoryCampaign, contacts: updatedContacts });
      }
    } else {
      setInlineStatus(prev => ({ ...prev, [contact.phone]: 'error' }));
      if (selectedHistoryCampaign) {
         const updatedContacts = selectedHistoryCampaign.contacts.map((c: any) => c.phone === contact.phone ? { ...c, error: result.error } : c);
         setSelectedHistoryCampaign({ ...selectedHistoryCampaign, contacts: updatedContacts });
      }
    }
    setTimeout(() => {
       setInlineStatus(prev => {
          const next = {...prev};
          delete next[contact.phone];
          return next;
       });
    }, 3000);
  };
`;

if (!content.includes('handleInlineRetry')) {
  content = content.replace(
    'const [selectedHistoryCampaign, setSelectedHistoryCampaign] = useState<any>(null);',
    'const [selectedHistoryCampaign, setSelectedHistoryCampaign] = useState<any>(null);\n' + inlineStateCode
  );
}

// 2. Wrap table in overflow-x-auto and add min-w-[600px]
content = content.replace(
  '<div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">',
  '<div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden overflow-x-auto">'
);
content = content.replace(
  '<table className="w-full text-left text-sm">',
  '<table className="w-full text-left text-sm min-w-[600px]">'
);

// 3. Add Action header
if (!content.includes('>Action</th>')) {
  content = content.replace(
    '<th className="px-6 py-4 font-bold">Status</th>',
    '<th className="px-6 py-4 font-bold">Status</th>\n                           <th className="px-6 py-4 font-bold">Action</th>'
  );
}

// 4. Add Action cell
const oldCellEnd = `                                 </div>
                               </td>
                             </tr>`;
const newCellEnd = `                                 </div>
                               </td>
                               <td className="px-6 py-4">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleInlineRetry(c); }} 
                                   disabled={inlineStatus[c.phone] === 'loading'}
                                   className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
                                 >
                                   {inlineStatus[c.phone] === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : (inlineStatus[c.phone] === 'success' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <RotateCcw className="w-3 h-3" />)}
                                   {inlineStatus[c.phone] === 'loading' ? 'Calling...' : (inlineStatus[c.phone] === 'success' ? 'Triggered!' : (c.status === 'failed' ? 'Retry' : 'Call Again'))}
                                 </button>
                               </td>
                             </tr>`;
if (!content.includes('handleInlineRetry(c)')) {
  content = content.replace(oldCellEnd, newCellEnd);
}

fs.writeFileSync(filePath, content);
console.log("Updated Outbound page with inline retry!");
