const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<StarfieldBackground\s+isDark=\{profile\.theme === 'dark'\}\s+isPaused=\{false\}\s+reducedMotion=\{Boolean\(profile\.reducedMotion\)\}\s+\/>/g,
  "{profile.theme === 'dark' && (\n        <StarfieldBackground \n          isDark={true} \n          isPaused={false} \n          reducedMotion={Boolean(profile.reducedMotion)}\n        />\n      )}"
);

fs.writeFileSync('src/App.tsx', code);
