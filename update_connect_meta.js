const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/campaigns/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add handleConnectMeta function right before return statement (or inside the component body)
const handlerCode = `
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

if (!content.includes('handleConnectMeta')) {
  // Let's place it right before "return ("
  content = content.replace("  return (", handlerCode + "\n  return (");
}

// 2. Update the Connect Meta button to use handleConnectMeta instead of window.location.href
const oldButtonRegex = /<button\s+onClick=\{\(\) => window\.location\.href = "\/api\/meta\/oauth\/login"\}/s;
if (content.match(oldButtonRegex)) {
  content = content.replace(oldButtonRegex, '<button \n                onClick={handleConnectMeta}');
}

fs.writeFileSync(filePath, content);
console.log("Updated Connect Meta button to use custom popup!");
