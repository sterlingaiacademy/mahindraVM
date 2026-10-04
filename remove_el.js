const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/config/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the ElevenLabs block
const startStr = `<div className="space-y-4 pt-4">\n                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-2">ElevenLabs AI Voice</h4>`;
const endStr = `<div className="pt-6">\n                <button type="submit" disabled={sysStatus === 'loading'}`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync(filePath, content);
  console.log("Removed ElevenLabs and Python engine from UI");
} else {
  console.log("Could not find blocks to remove.");
}
