const fs = require('fs');
let code = fs.readFileSync('src/components/SplashScreen.tsx', 'utf8');

// Check if already replaced
if (code.includes('const [progress, setProgress] = useState(0);')) {
  code = code.replace(
    "const [progress, setProgress] = useState(0);",
    "const progressRef = useRef<HTMLDivElement>(null);\n  const progressTextRef = useRef<HTMLSpanElement>(null);"
  );

  code = code.replace(
    "setProgress(Math.floor(easedProgress * 100));",
    "const p = Math.floor(easedProgress * 100);\n      if (progressRef.current) progressRef.current.style.width = `${p}%`;\n      if (progressTextRef.current) progressTextRef.current.innerText = `${p}%`;"
  );

  code = code.replace(
    "style={{ width: `${progress}%`, willChange: 'width' }}",
    "ref={progressRef}\n              style={{ width: '0%', willChange: 'width' }}"
  );

  code = code.replace(
    "<span className=\"text-slate-200 tabular-nums\">{progress}%</span>",
    "<span ref={progressTextRef} className=\"text-slate-200 tabular-nums\">0%</span>"
  );
  
  // Try replacing filter (maybe there's different spacing)
  code = code.replace(/filter:\s*'blur\(6px\)'/g, "/* filter removed for performance */");
  code = code.replace(/filter:\s*isExpanding\s*\?\s*'blur\(0px\)'\s*:\s*'blur\(6px\)',/g, "");

  fs.writeFileSync('src/components/SplashScreen.tsx', code);
  console.log("Successfully replaced in SplashScreen.tsx");
} else {
  console.log("No match found for progress state");
}
