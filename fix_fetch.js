const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/campaigns/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the fetch line
content = content.replace(
  "fetch(/api/meta/audiences?id=${audienceToDelete}, { method: 'DELETE' });",
  "fetch(`/api/meta/audiences?id=${audienceToDelete}`, { method: 'DELETE' });"
);

fs.writeFileSync(filePath, content);
console.log("Fixed fetch URL.");
