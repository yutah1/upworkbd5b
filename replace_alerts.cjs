const fs = require('fs');

let content = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

content = content.replace(/alert\((.*?)\)/g, 'showAlert($1)');

// Replace if (window.confirm(MSG)) { BODY }
// We will do a simple state machine to find the matching braces.
let result = '';
let i = 0;
while (i < content.length) {
  const match = content.substring(i).match(/if\s*\(\s*window\.confirm\((.*?)\)\s*\)\s*\{/);
  if (!match) {
    result += content.substring(i);
    break;
  }
  
  const startIndex = i + match.index;
  result += content.substring(i, startIndex);
  
  const msg = match[1];
  let braceCount = 1;
  let j = startIndex + match[0].length;
  let bodyStartIndex = j;
  
  while (j < content.length && braceCount > 0) {
    if (content[j] === '{') braceCount++;
    if (content[j] === '}') braceCount--;
    j++;
  }
  
  const body = content.substring(bodyStartIndex, j - 1);
  
  result += `showConfirm(${msg}, async () => {${body}});`;
  i = j;
}

// Also need to add the modals to the JSX return.
// Find the end of the file or the main return.
// The main return is `return ( <div className="min-h-screen...`
const returnIndex = result.indexOf('return (\n    <div className="min-h-screen');
if (returnIndex !== -1) {
  const modals = `
      <ConfirmModal 
        isOpen={confirmDialog?.isOpen || false}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => {
          if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
        }}
        message={confirmDialog?.message || ''}
      />
      <AlertModal 
        isOpen={alertDialog?.isOpen || false}
        onClose={() => setAlertDialog(null)}
        message={alertDialog?.message || ''}
      />
`;
  result = result.substring(0, returnIndex + 9) + modals + result.substring(returnIndex + 9);
}

fs.writeFileSync('src/AdminPanel.tsx', result);
console.log('Replaced alerts and confirms in AdminPanel.tsx');
