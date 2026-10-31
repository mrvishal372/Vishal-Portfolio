const fs = require('fs');
let code = fs.readFileSync('src/components/SplashScreen.tsx', 'utf8');
if (!code.includes('useRef')) {
  code = code.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState, useRef } from 'react';");
  fs.writeFileSync('src/components/SplashScreen.tsx', code);
}
