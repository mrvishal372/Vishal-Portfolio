const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
console.log("PROJECT_ID_IN_FILE:", config.projectId);
console.log("API_KEY_IN_FILE:", config.apiKey);
