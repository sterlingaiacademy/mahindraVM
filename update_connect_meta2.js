const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/campaigns/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const functionCode = `
  const handleConnectMeta = async () => {
    try {
      const res = await fetch('/api/credentials/system');
      const config = await res.json();
      if (!config.META_APP_ID || !config.META_APP_SECRET) {
        showToast("Please enter your Meta credentials in the Account Config tab first!", "error");
        return;
      }
      window.location.href = "/api/meta/oauth/login";
    } catch (error) {
      showToast("Failed to verify Meta configuration.", "error");
    }
  };
`;

// Insert the function safely after showToast
content = content.replace(
  "const fetchData = async () => {",
  functionCode + "\n  const fetchData = async () => {"
);

// Replace exactly the exact button string without greedy regex
const exactOldButton = `onClick={() => window.location.href = "/api/meta/oauth/login"}`;
const exactNewButton = `onClick={handleConnectMeta}`;

content = content.replace(exactOldButton, exactNewButton);

fs.writeFileSync(filePath, content);
console.log("Safely updated Connect Meta button!");
