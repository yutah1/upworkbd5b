const fs = require('fs');

let content = fs.readFileSync('src/PremiumBuyPage.tsx', 'utf8');

// Replace alert("...") with showAlert("...")
content = content.replace(/alert\((.*?)\)/g, 'showAlert($1)');

// Also need to add the modals to the JSX return.
const returnIndex = content.indexOf('return (\n    <div className="min-h-screen');
if (returnIndex !== -1) {
  const modals = `
      <AlertModal 
        isOpen={alertDialog?.isOpen || false}
        onClose={() => setAlertDialog(null)}
        message={alertDialog?.message || ''}
      />
`;
  content = content.substring(0, returnIndex + 9) + modals + content.substring(returnIndex + 9);
}

fs.writeFileSync('src/PremiumBuyPage.tsx', content);
console.log('Replaced alerts in PremiumBuyPage.tsx');
