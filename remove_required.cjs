const fs = require('fs');
let content = fs.readFileSync('src/AdminPanel.tsx', 'utf8');
content = content.replace(/ required /g, ' ');
content = content.replace(/<input required/g, '<input');
content = content.replace(/<textarea required/g, '<textarea');
content = content.replace(/required\n/g, '\n');
fs.writeFileSync('src/AdminPanel.tsx', content);
