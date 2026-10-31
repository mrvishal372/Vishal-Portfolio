const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

code = code.replace(
  'bg-purple-600/15 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none',
  'hidden dark:block bg-purple-600/15 rounded-full blur-3xl pointer-events-none'
);
code = code.replace(
  'bg-[#FF9933]/15 dark:bg-[#FF9933]/15 rounded-full blur-3xl pointer-events-none',
  'hidden dark:block bg-[#FF9933]/15 rounded-full blur-3xl pointer-events-none'
);
code = code.replace(
  'bg-[#138808]/15 dark:bg-[#138808]/15 rounded-full blur-3xl pointer-events-none',
  'hidden dark:block bg-[#138808]/15 rounded-full blur-3xl pointer-events-none'
);

fs.writeFileSync('src/components/views/HomeView.tsx', code);
