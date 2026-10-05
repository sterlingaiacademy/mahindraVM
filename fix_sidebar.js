const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the Sidebar classes
content = content.replace(
  'isCollapsed ? "w-[72px] hidden md:flex" : "w-72 md:w-64",',
  'isCollapsed ? "w-72 md:w-[72px]" : "w-72 md:w-64",'
);

fs.writeFileSync(filePath, content);
console.log("Fixed sidebar mobile view!");
