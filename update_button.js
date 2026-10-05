const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/outbound/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldHeader = `      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
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

const newHeader = `      <header className="mb-10 flex flex-col items-start relative z-10">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Outbound Campaign
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Trigger manual or bulk AI outbound calls via your Voice AI Engine.</p>
      </header>`;

content = content.replace(oldHeader, newHeader);

// 2. Add button below form
const oldFormEnd = `              )}
            </form>

          </div>`;

const newFormEnd = `              )}
            </form>

            <button onClick={() => { setIsHistoryModalOpen(true); setSelectedHistoryCampaign(null); }}
              className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-xs border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors rounded-3xl flex items-center justify-center gap-2">
              <History className="w-4 h-4" /> Recent Campaigns
            </button>
          </div>`;

content = content.replace(oldFormEnd, newFormEnd);

fs.writeFileSync(filePath, content);
console.log("Updated button placement!");
