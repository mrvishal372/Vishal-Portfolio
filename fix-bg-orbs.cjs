const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The wrapper for the gradient orbs is:
// <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden transition-opacity duration-700 opacity-85 select-none">
// We want to add 'hidden dark:block' so it only shows in dark mode
code = code.replace(
  '<div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden transition-opacity duration-700 opacity-85 select-none">',
  '<div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden transition-opacity duration-700 opacity-85 select-none hidden dark:block">'
);

fs.writeFileSync('src/App.tsx', code);
