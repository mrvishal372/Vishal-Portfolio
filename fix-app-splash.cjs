const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[showSplash, setShowSplash\] = useState\(true\);/g,
  "const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'));"
);

// We should also replace the activeTab, etc.
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<NavTab>\('home'\);/g,
  "const [activeTab, setActiveTab] = useState<NavTab>(() => (sessionStorage.getItem('activeTab') as NavTab) || 'home');"
);

code = code.replace(
  /const \[profileSubTab, setProfileSubTab\] = useState<ProfileSubTab>\('portfolio'\);/g,
  "const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>(() => (sessionStorage.getItem('profileSubTab') as ProfileSubTab) || 'portfolio');"
);

code = code.replace(
  /const \[activeModule, setActiveModule\] = useState<ModuleId \| null>\(null\);/g,
  "const [activeModule, setActiveModule] = useState<ModuleId | null>(() => (sessionStorage.getItem('activeModule') as ModuleId) || null);"
);

fs.writeFileSync('src/App.tsx', code);
