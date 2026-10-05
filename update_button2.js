const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/outbound/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<\/form>\s*<\/div>/;

const newFormEnd = `</form>
          <button onClick={() => { setIsHistoryModalOpen(true); setSelectedHistoryCampaign(null); }}
            className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-xs border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors rounded-3xl flex items-center justify-center gap-2">
            <History className="w-4 h-4" /> Recent Campaigns
          </button>
        </div>`;

content = content.replace(regex, newFormEnd);
fs.writeFileSync(filePath, content);
console.log("Updated using regex!");
