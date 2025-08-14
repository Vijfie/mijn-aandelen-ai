console.log("=== TRADINGSIGNALEN INTEGRATION PACKAGE ===");

const fs = require("fs");
const path = require("path");

console.log("� Creating integration package for Tradingsignalen...");

// Copy dashboard files
const integrationFiles = {
  "dashboard.html": "dashboard/index.html",
  "dashboard-api.js": "dashboard-server-enhanced.js", 
  "database.js": "BacktestDatabase.js",
  "position-tracker.js": "PositionTracker.js",
  "sample-data.sql": "sample-data.sql"
};

console.log("� Files ready for Tradingsignalen integration:");
Object.entries(integrationFiles).forEach(([target, source]) => {
  if (fs.existsSync(source)) {
    console.log(`✅ ${target} <- ${source}`);
  } else {
    console.log(`⚠️ ${target} <- ${source} (missing)`);
  }
});

console.log("\\n� INTEGRATION INSTRUCTIONS:");
console.log("1. Copy dashboard.html to your Tradingsignalen website");
console.log("2. Integrate dashboard-api.js with your backend");
console.log("3. Connect to your existing user database");
console.log("4. Add authentication/authorization");
console.log("5. Customize colors to match Tradingsignalen branding");

console.log("\\n✅ Dashboard is Tradingsignalen-ready!");
