const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "if (!currentUser && !isLoggedIn) {",
  "// Auto popup disabled based on user request to fix 'do do baar opening pop up'\n    // if (!currentUser && !isLoggedIn) {"
);

code = code.replace(
  "setIsWelcomeAuthOpen(true);\n    }",
  "//   setIsWelcomeAuthOpen(true);\n    // }"
);

fs.writeFileSync('src/App.tsx', code);
