import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Copy, 
  Download, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Terminal, 
  Code2, 
  Undo2, 
  Redo2, 
  CheckSquare, 
  Check, 
  Zap, 
  Sliders, 
  Eraser, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

const languages = ['HTML/CSS/JS', 'HTML', 'CSS', 'JavaScript', 'Java', 'Python', 'C', 'C++', 'SQL'];

const defaultTemplates: Record<string, string> = {
  'HTML/CSS/JS': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Developer Playground</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
      color: #0f172a;
    }
    .card {
      background: white;
      padding: 32px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      text-align: center;
      max-width: 420px;
      width: 100%;
    }
    h1 {
      margin-top: 0;
      font-size: 26px;
      color: #1e293b;
    }
    p {
      color: #64748b;
      line-height: 1.6;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
      transition: all 0.2s ease;
    }
    button:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }
    .badge {
      display: inline-block;
      margin-top: 18px;
      padding: 6px 14px;
      background: #f1f5f9;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1 id="headline">🚀 Vyron Coding Lab</h1>
    <p>Live HTML, CSS and JavaScript sandbox! Edit this code and click Run to see instant interactive results.</p>
    <button onclick="handleCounter()">Click Me: <span id="count">0</span></button>
    <br/>
    <div id="status" class="badge">Status: Ready</div>
  </div>

  <script>
    let count = 0;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    function handleCounter() {
      count++;
      document.getElementById('count').textContent = count;
      const color = colors[count % colors.length];
      document.getElementById('headline').style.color = color;
      document.getElementById('status').textContent = 'Button clicked ' + count + ' time(s)!';
      console.log('User interaction logged! Current count = ' + count);
    }
  </script>
</body>
</html>`,

  'HTML': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clean HTML5 Page</title>
</head>
<body style="font-family: sans-serif; padding: 24px;">
  <h1>Hello from HTML5!</h1>
  <p>This is a pure HTML starter page. You can add tables, forms, lists, and images.</p>
  <ul>
    <li>Fast live preview</li>
    <li>HTML5 semantic tags</li>
    <li>Ready for custom styling</li>
  </ul>
</body>
</html>`,

  'CSS': `/* Write your CSS rules here to style the live components! */
body {
  font-family: 'Poppins', system-ui, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  margin: 0;
  padding: 24px;
}

h1 {
  color: #2563eb;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

p {
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.45);
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-top: 16px;
}

.badge {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
}`,

  'JavaScript': `// Welcome to JavaScript Sandbox!
// All console.log statements and return values will be displayed in the console.

function fibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

console.log("Computing Fibonacci Sequence (first 10 numbers):");
const fib10 = fibonacci(10);
console.log(fib10.join(', '));

// Object exploration
const developer = {
  name: "Vishal Yadav",
  role: "BCA Student & Vyron AI Creator",
  skills: ["JavaScript", "React", "Python", "C", "Java"],
  status: "Coding Super App"
};

console.log("Developer Profile:", JSON.stringify(developer, null, 2));

// Filter demo
const primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
const squares = primeNumbers.map(x => x * x);
console.log("Squares of primes:", squares.slice(0, 5));
`,

  'Java': `// Welcome to Java Runtime Sandbox!
// Note: Class name must be "Main"
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("  Hello from Java 17 Runtime!");
        System.out.println("========================================");
        
        // Loop Demonstration
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum of numbers from 1 to 10: " + sum);
        
        // Collections Demo
        List<String> techStack = new ArrayList<>();
        techStack.add("Java 17");
        techStack.add("Data Structures & Algorithms");
        techStack.add("Object Oriented Programming");
        techStack.add("Full Stack Development");
        
        System.out.println("\nCore Modules:");
        for (int i = 0; i < techStack.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + techStack.get(i));
        }
    }
}`,

  'Python': `# Welcome to Python 3 Runtime Sandbox!
# Executes fast and accurately with full Python 3 standard library.

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

print("=== Python 3 Fast Runner ===")
primes = [x for x in range(1, 50) if is_prime(x)]
print(f"Prime numbers up to 50: {primes}")
print(f"Total count: {len(primes)}")

# Dictionary comprehension
stats = {x: f"square={x**2}" for x in range(1, 6)}
print(f"\nStats Dictionary: {stats}")
print("✓ Execution completed successfully!")`,

  'C': `#include <stdio.h>

// Welcome to C Programming Sandbox!
// Standard I/O, loops, pointers, and structures supported.

void printPattern(int n) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("* ");
        }
        printf("\\n");
    }
}

int main() {
    printf("========================================\\n");
    printf("  Hello from C Sandbox! (GCC Engine)\\n");
    printf("========================================\\n\\n");
    
    int numbers[] = {12, 45, 78, 23, 56, 89, 90, 34};
    int count = sizeof(numbers) / sizeof(numbers[0]);
    int max = numbers[0];
    
    for (int i = 1; i < count; i++) {
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }
    
    printf("Array elements count: %d\\n", count);
    printf("Maximum element in array: %d\\n\\n", max);
    
    printf("Star Pyramid Pattern:\\n");
    printPattern(5);
    
    return 0;
}`,

  'C++': `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

// Welcome to C++ (G++ Modern C++20 Sandbox)!
int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  Hello from Modern C++ Sandbox!" << std::endl;
    std::cout << "========================================" << std::endl;
    
    std::vector<std::string> tools = {"C++", "Java", "Python", "JavaScript", "SQL"};
    
    std::cout << "Available Languages in Lab:" << std::endl;
    for (size_t i = 0; i < tools.size(); ++i) {
        std::cout << "  [" << (i + 1) << "] " << tools[i] << std::endl;
    }
    
    // Modern Lambdas & Sorting
    std::vector<int> nums = {42, 17, 89, 3, 56, 28};
    std::sort(nums.begin(), nums.end());
    
    std::cout << "\\nSorted Vector: ";
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,

  'SQL': `-- Welcome to SQL Query Sandbox!
-- Write DDL, DML and SELECT queries.

CREATE TABLE Students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    course TEXT NOT NULL,
    marks INTEGER
);

INSERT INTO Students (id, name, course, marks) VALUES
(1, 'Vishal Yadav', 'BCA', 95),
(2, 'Amit Sharma', 'B.Tech', 88),
(3, 'Priya Singh', 'MCA', 92),
(4, 'Rahul Verma', 'BCA', 84),
(5, 'Sneha Patel', 'B.Tech', 90);

-- Query: Students with marks >= 85
SELECT id, name, course, marks
FROM Students
WHERE marks >= 85
ORDER BY marks DESC;`
};

const QUICK_SYMBOLS = [
  'Tab', '{', '}', '(', ')', '[', ']', '<', '>', '=', ';', ':', '"', "'", '/', '+', '-', '*', '!', '_'
];

interface HistoryEntry {
  code: string;
  cursor: number;
}

export const CodingLab: React.FC = () => {
  const [activeLanguage, setActiveLanguage] = useState('HTML/CSS/JS');
  const [code, setCode] = useState(defaultTemplates['HTML/CSS/JS']);
  const [outputHtml, setOutputHtml] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStdin, setShowStdin] = useState(false);
  const [stdinInput, setStdinInput] = useState('');
  
  // Editor mode: 'FAST' (zero-latency native code editor) vs 'MONACO' (desktop Monaco)
  const [editorMode, setEditorMode] = useState<'FAST' | 'MONACO'>('FAST');

  // Mobile layout state
  const [activeTab, setActiveTab] = useState<'CODE' | 'PREVIEW' | 'CONSOLE'>('CODE');
  const [isMobile, setIsMobile] = useState(false);

  // Undo / Redo history state
  const [history, setHistory] = useState<HistoryEntry[]>([{ code: defaultTemplates['HTML/CSS/JS'], cursor: 0 }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for native fast editor
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<any>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setEditorMode('FAST');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen to escape key for fullscreen exit
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isFullscreen]);

  // Update history helper
  const pushHistory = useCallback((newCode: string, cursor: number) => {
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
    }
    historyDebounceRef.current = setTimeout(() => {
      setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        if (sliced.length > 0 && sliced[sliced.length - 1].code === newCode) {
          return sliced;
        }
        const updated = [...sliced, { code: newCode, cursor }];
        if (updated.length > 60) updated.shift();
        return updated;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 59));
    }, 250);
  }, [historyIndex]);

  const handleLanguageChange = (lang: string) => {
    setActiveLanguage(lang);
    const template = defaultTemplates[lang] || '';
    setCode(template);
    setHistory([{ code: template, cursor: 0 }]);
    setHistoryIndex(0);
    setConsoleOutput([]);
    setOutputHtml('');
    setActiveTab('CODE');
    if (monacoEditorRef.current) {
      monacoEditorRef.current.setValue(template);
    }
  };

  const handleUndo = () => {
    if (editorMode === 'MONACO' && monacoEditorRef.current) {
      monacoEditorRef.current.trigger('keyboard', 'undo', null);
      setCode(monacoEditorRef.current.getValue());
      return;
    }

    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      const targetEntry = history[targetIdx];
      setHistoryIndex(targetIdx);
      setCode(targetEntry.code);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const pos = Math.min(targetEntry.cursor, targetEntry.code.length);
          textareaRef.current.setSelectionRange(pos, pos);
        }
      }, 0);
    }
  };

  const handleRedo = () => {
    if (editorMode === 'MONACO' && monacoEditorRef.current) {
      monacoEditorRef.current.trigger('keyboard', 'redo', null);
      setCode(monacoEditorRef.current.getValue());
      return;
    }

    if (historyIndex < history.length - 1) {
      const targetIdx = historyIndex + 1;
      const targetEntry = history[targetIdx];
      setHistoryIndex(targetIdx);
      setCode(targetEntry.code);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const pos = Math.min(targetEntry.cursor, targetEntry.code.length);
          textareaRef.current.setSelectionRange(pos, pos);
        }
      }, 0);
    }
  };

  const handleSelectAll = () => {
    if (editorMode === 'MONACO' && monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monacoEditorRef.current.setSelection(model.getFullModelRange());
        monacoEditorRef.current.focus();
      }
      return;
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  };

  // Instant one-click backspace erase for mobile
  const handleOneErase = () => {
    if (editorMode === 'MONACO' && monacoEditorRef.current) {
      monacoEditorRef.current.trigger('keyboard', 'deleteLeft', null);
      setCode(monacoEditorRef.current.getValue());
      return;
    }

    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const newCode = code.slice(0, start) + code.slice(end);
      setCode(newCode);
      pushHistory(newCode, start);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start);
      }, 0);
    } else if (start > 0) {
      const newCode = code.slice(0, start - 1) + code.slice(start);
      setCode(newCode);
      pushHistory(newCode, start - 1);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start - 1, start - 1);
      }, 0);
    }
  };

  // Quick symbol insertion at cursor
  const handleInsertSymbol = (sym: string) => {
    const textToInsert = sym === 'Tab' ? '  ' : sym;
    if (editorMode === 'MONACO' && monacoEditorRef.current) {
      monacoEditorRef.current.trigger('keyboard', 'type', { text: textToInsert });
      setCode(monacoEditorRef.current.getValue());
      return;
    }

    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newCode = code.slice(0, start) + textToInsert + code.slice(end);
    const newPos = start + textToInsert.length;
    setCode(newCode);
    pushHistory(newCode, newPos);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Synchronize line gutter scrolling
  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Zero-delay native textarea change handler
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCode(nextVal);
    pushHistory(nextVal, cursorPos);
  };

  // Keyboard shortcut handler for laptop / desktop (Ctrl+Z, Ctrl+Y, Tab, Ctrl+A, Ctrl+Enter)
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Undo: Ctrl+Z / Cmd+Z (without shift)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    // Redo: Ctrl+Y / Cmd+Y OR Ctrl+Shift+Z / Cmd+Shift+Z
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey)) {
      e.preventDefault();
      handleRedo();
      return;
    }

    // Run: Ctrl+Enter / Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
      return;
    }

    // Tab key: Insert 2 spaces indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newCode = code.slice(0, start) + '  ' + code.slice(end);
      setCode(newCode);
      pushHistory(newCode, start + 2);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + 2, start + 2);
      }, 0);
      return;
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOutput([]);

    // 1. HTML / CSS / JS Mode
    if (activeLanguage === 'HTML/CSS/JS' || activeLanguage === 'HTML') {
      setTimeout(() => {
        const consoleScript = `
          <script>
            (function() {
              const send = function(method, args) {
                try {
                  window.parent.postMessage({
                    type: 'console',
                    method: method,
                    data: args.map(function(a) {
                      if (typeof a === 'object' && a !== null) {
                        try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
                      }
                      return String(a);
                    })
                  }, '*');
                } catch(e) {}
              };
              const origLog = console.log;
              const origErr = console.error;
              const origWarn = console.warn;
              const origInfo = console.info;

              console.log = function(...args) { send('log', args); origLog.apply(console, args); };
              console.error = function(...args) { send('error', args); origErr.apply(console, args); };
              console.warn = function(...args) { send('warn', args); origWarn.apply(console, args); };
              console.info = function(...args) { send('info', args); origInfo.apply(console, args); };

              window.onerror = function(msg, url, line, col, error) {
                send('error', [msg + ' (Line: ' + line + (col ? ':' + col : '') + ')']);
                return false;
              };
            })();
          </script>
        `;

        let finalHtml = '';
        if (/<head[\s>]/i.test(code)) {
          finalHtml = code.replace(/<head[\s>]/i, match => match + '\n' + consoleScript);
        } else if (/<html[\s>]/i.test(code)) {
          finalHtml = code.replace(/<html[\s>]/i, match => match + '\n<head>' + consoleScript + '</head>');
        } else {
          finalHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    ${consoleScript}
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #ffffff;
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    ${code}
  </body>
</html>`;
        }

        setOutputHtml(finalHtml);
        setConsoleOutput(['✓ HTML & Web Preview compiled successfully.']);
        if (isMobile) setActiveTab('PREVIEW');
        setIsRunning(false);
      }, 200);
      return;
    }

    // 2. CSS Mode
    if (activeLanguage === 'CSS') {
      setTimeout(() => {
        const cssShowcaseHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      /* User CSS Styles */
      ${code}
    </style>
  </head>
  <body>
    <div style="padding: 24px; max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <h1>🎨 CSS Showcase Preview</h1>
      <p>This is a live preview demonstrating typography, card styling, buttons, and badges styled with your custom CSS.</p>
      
      <div style="display: flex; gap: 12px; margin: 20px 0; flex-wrap: wrap;">
        <button class="btn primary-btn">Primary Action</button>
        <button class="btn secondary-btn" style="background: #e2e8f0; color: #1e293b;">Secondary Action</button>
      </div>

      <div class="card" style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 14px; margin-top: 20px;">
        <h3>Sample Card Container</h3>
        <p>Edit your CSS on the left or top to see real-time color, shadow, hover and layout changes!</p>
        <span class="badge" style="display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">Active Badge</span>
      </div>
    </div>
  </body>
</html>`;
        setOutputHtml(cssShowcaseHtml);
        setConsoleOutput(['✓ CSS Styles applied successfully to Live Component Preview.']);
        if (isMobile) setActiveTab('PREVIEW');
        setIsRunning(false);
      }, 200);
      return;
    }

    // 3. JavaScript Mode
    if (activeLanguage === 'JavaScript') {
      setTimeout(() => {
        try {
          const logs: string[] = [];
          const customLog = (...args: any[]) => {
            logs.push(args.map(a => {
              if (typeof a === 'object' && a !== null) {
                try { return JSON.stringify(a, null, 2); } catch { return String(a); }
              }
              return String(a);
            }).join(' '));
          };

          const sandboxConsole = {
            log: customLog,
            error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
            warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
            info: customLog,
            table: customLog,
          };

          const runFn = new Function('console', code);
          const returnedVal = runFn(sandboxConsole);
          if (returnedVal !== undefined) {
            logs.push(`↳ Return Value: ${typeof returnedVal === 'object' ? JSON.stringify(returnedVal) : String(returnedVal)}`);
          }

          if (logs.length === 0) {
            logs.push('✓ Program finished successfully with no output.');
          }
          setConsoleOutput(logs);
        } catch (err: any) {
          setConsoleOutput([`[ERROR] ${err.message}`]);
        }
        if (isMobile) setActiveTab('CONSOLE');
        setIsRunning(false);
      }, 150);
      return;
    }

    // 4. Backend Engine (Java, Python, C, C++, SQL)
    setConsoleOutput([`$ Compiling and running ${activeLanguage} program...`]);
    if (isMobile) setActiveTab('CONSOLE');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          language: activeLanguage, 
          code,
          stdin: stdinInput.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error status ' + response.status);
      }

      const result = await response.json();
      const newOutput: string[] = [`$ ${activeLanguage} Execution Log:`];

      if (result.output) {
        newOutput.push(...result.output.trim().split('\n'));
      }
      if (result.error) {
        newOutput.push(...result.error.trim().split('\n').map((line: string) => `[ERROR] ${line}`));
      }
      if (!result.output && !result.error) {
        newOutput.push('✓ Program finished successfully with no output.');
      }

      setConsoleOutput(newOutput.filter(Boolean));
    } catch (err: any) {
      setConsoleOutput([`[ERROR] Execution failed: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'console') {
        setConsoleOutput(prev => [...prev, `[${event.data.method.toUpperCase()}] ${event.data.data.join(' ')}`]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let ext = 'txt';
    if (activeLanguage === 'HTML/CSS/JS' || activeLanguage === 'HTML') ext = 'html';
    if (activeLanguage === 'CSS') ext = 'css';
    if (activeLanguage === 'JavaScript') ext = 'js';
    if (activeLanguage === 'Python') ext = 'py';
    if (activeLanguage === 'Java') ext = 'java';
    if (activeLanguage === 'C') ext = 'c';
    if (activeLanguage === 'C++') ext = 'cpp';
    if (activeLanguage === 'SQL') ext = 'sql';

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_${activeLanguage.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('Reset code to default template?')) {
      const template = defaultTemplates[activeLanguage] || '';
      setCode(template);
      setHistory([{ code: template, cursor: 0 }]);
      setHistoryIndex(0);
      setOutputHtml('');
      setConsoleOutput([]);
      if (monacoEditorRef.current) {
        monacoEditorRef.current.setValue(template);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      try {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        }
      } catch {}
      setIsFullscreen(true);
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
      setIsFullscreen(false);
    }
  };

  const getMonacoLanguage = () => {
    if (activeLanguage === 'HTML/CSS/JS' || activeLanguage === 'HTML') return 'html';
    if (activeLanguage === 'C++') return 'cpp';
    if (activeLanguage === 'SQL') return 'sql';
    if (activeLanguage === 'Java') return 'java';
    return activeLanguage.toLowerCase();
  };

  const lineCount = Math.max(1, code.split('\n').length);

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-200 ${
        isFullscreen 
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none' 
          : 'h-[850px] max-h-[88vh] rounded-3xl overflow-hidden'
      }`}
    >
      {/* 🛠️ Top Bar / Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 gap-2.5 shrink-0 select-none">
        
        {/* Left: Branding, Language Select, Editor Mode */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shrink-0 text-xs sm:text-sm">
            <Code2 className="w-4 h-4 shrink-0" />
            <span>Coding Lab</span>
          </div>

          {/* Language Selector */}
          <div className="relative shrink-0">
            <select 
              value={activeLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs appearance-none"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Fast vs Monaco Toggle on desktop */}
          {!isMobile && (
            <button
              onClick={() => setEditorMode(prev => prev === 'FAST' ? 'MONACO' : 'FAST')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                editorMode === 'FAST'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title={editorMode === 'FAST' ? 'Super Fast Mode active (Zero-lag backspace)' : 'Monaco VS Code mode active'}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{editorMode === 'FAST' ? '⚡ Fast Editor' : '💻 Monaco'}</span>
            </button>
          )}

          {/* Stdin button for compiled languages */}
          {['Java', 'Python', 'C', 'C++'].includes(activeLanguage) && (
            <button
              onClick={() => setShowStdin(prev => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                showStdin
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/40'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title="Toggle input (stdin) panel for scanf / input() / Scanner"
            >
              <span>Stdin Input</span>
            </button>
          )}
        </div>

        {/* Right: Actions (Undo, Redo, Select All, Copy, Download, Run, Fullscreen) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none justify-between sm:justify-end">
          
          <div className="flex items-center gap-1 shrink-0">
            {/* ↩ Undo Button */}
            <button 
              onClick={handleUndo} 
              disabled={editorMode === 'FAST' && historyIndex <= 0}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            {/* ↪ Redo Button */}
            <button 
              onClick={handleRedo} 
              disabled={editorMode === 'FAST' && historyIndex >= history.length - 1}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            {/* 🔲 Select All Button */}
            <button 
              onClick={handleSelectAll} 
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg shrink-0 flex items-center gap-1 transition-colors text-xs font-semibold" 
              title="Select All Code (Ctrl+A)"
              aria-label="Select All Code"
            >
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              <span className="hidden md:inline">Select All</span>
            </button>

            {/* Reset Button */}
            <button 
              onClick={handleReset} 
              className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg shrink-0 transition-colors" 
              title="Reset Code Template"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Copy Button with live feedback */}
            <button 
              onClick={handleCopy} 
              className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg shrink-0 transition-colors" 
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            <button 
              onClick={handleDownload} 
              className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg shrink-0 transition-colors" 
              title="Download Code File"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* ⛶ Fullscreen Button (Visible on Mobile, Tablet & Laptop!) */}
            <button 
              onClick={toggleFullscreen} 
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl shrink-0 flex items-center gap-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors" 
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen (Fullscreen)"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold hidden sm:inline text-amber-500">Exit</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold hidden sm:inline text-blue-500">Full Screen</span>
                </>
              )}
            </button>

            {/* ▶️ RUN CODE BUTTON */}
            <button 
              onClick={handleRun} 
              disabled={isRunning} 
              className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-blue-600 active:scale-95 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold transition-all shrink-0 disabled:opacity-70 shadow-md shadow-blue-500/20 text-xs sm:text-sm cursor-pointer"
            >
              <Play className={`w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Optional Program Stdin Input Bar */}
      {showStdin && ['Java', 'Python', 'C', 'C++'].includes(activeLanguage) && (
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-900/60 flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0">Input (stdin):</span>
          <input
            type="text"
            value={stdinInput}
            onChange={(e) => setStdinInput(e.target.value)}
            placeholder="Type input for scanf() / input() / Scanner here..."
            className="flex-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Mobile Tabs */}
      {isMobile && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 select-none">
          <button 
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${activeTab === 'CODE' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500'}`}
            onClick={() => setActiveTab('CODE')}
          >
            CODE
          </button>
          {(activeLanguage === 'HTML/CSS/JS' || activeLanguage === 'HTML' || activeLanguage === 'CSS') && (
            <button 
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${activeTab === 'PREVIEW' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500'}`}
              onClick={() => setActiveTab('PREVIEW')}
            >
              PREVIEW
            </button>
          )}
          <button 
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${activeTab === 'CONSOLE' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500'}`}
            onClick={() => setActiveTab('CONSOLE')}
          >
            CONSOLE
          </button>
        </div>
      )}

      {/* 🚀 Mobile Quick Symbol Bar (Directly Above Keyboard for Super Smooth Typing & Instant Erase) */}
      {(!isMobile || activeTab === 'CODE') && (
        <div className="flex items-center gap-1 px-2 py-1.5 bg-[#141820] border-b border-slate-800/80 overflow-x-auto scrollbar-none shrink-0 select-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1 shrink-0">Quick Bar:</span>
          
          {/* Quick Erase / Backspace Button */}
          <button
            onClick={handleOneErase}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono text-xs font-bold border border-rose-500/30 active:scale-90 transition-all shrink-0"
            title="Erase 1 Character (Backspace)"
          >
            <Eraser className="w-3 h-3" />
            <span>⌫ Erase</span>
          </button>

          {QUICK_SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => handleInsertSymbol(sym)}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-slate-200 hover:text-white font-mono text-xs font-semibold border border-slate-700/60 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {sym}
            </button>
          ))}
        </div>
      )}

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
        
        {/* Editor Area */}
        {(!isMobile || activeTab === 'CODE') && (
          <div className={`flex flex-col flex-1 relative ${!isMobile && (activeLanguage === 'HTML/CSS/JS' || activeLanguage === 'HTML' || activeLanguage === 'CSS') ? 'sm:border-r border-slate-200 dark:border-slate-800' : ''}`}>
            
            {/* FAST NATIVE CODE EDITOR (Default: Zero Latency, Instant Backspace & Native Touch Selection) */}
            {editorMode === 'FAST' ? (
              <div className="flex-1 flex overflow-hidden bg-[#1e1e1e] text-slate-100 font-mono text-sm leading-6 relative">
                
                {/* Synchronized Line Numbers Gutter */}
                <div 
                  ref={lineGutterRef}
                  className="w-10 sm:w-12 py-3 px-1 text-right select-none text-slate-500 bg-[#181818] border-r border-slate-800/80 font-mono text-xs sm:text-sm overflow-hidden shrink-0"
                >
                  {Array.from({ length: lineCount }).map((_, i) => (
                    <div key={i + 1} className="leading-6 opacity-75">{i + 1}</div>
                  ))}
                </div>

                {/* Native Textarea with Smooth Erase & Fluid Typing */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleTextareaChange}
                  onKeyDown={handleTextareaKeyDown}
                  onScroll={handleTextareaScroll}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  wrap="off"
                  className="flex-1 h-full w-full py-3 px-3.5 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 resize-none outline-none border-none overflow-auto focus:ring-0 whitespace-pre tab-[2] selection:bg-blue-600/40 selection:text-white caret-blue-400"
                  placeholder="Type or paste your code here..."
                  style={{
                    tabSize: 2,
                    WebkitOverflowScrolling: 'touch',
                  }}
                />
              </div>
            ) : (
              /* MONACO EDITOR (Desktop Option) */
              <div className="flex-1 min-h-0 pt-2 bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={getMonacoLanguage()}
                  theme="vs-dark"
                  value={code}
                  onMount={(editor) => {
                    monacoEditorRef.current = editor;
                  }}
                  onChange={(value) => {
                    const nextVal = value || '';
                    setCode(nextVal);
                    pushHistory(nextVal, nextVal.length);
                  }}
                  options={{
                    minimap: { enabled: !isMobile },
                    fontSize: isMobile ? 12 : 14,
                    wordWrap: 'on',
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Right Panel: Preview or Output */}
        {(!isMobile || activeTab === 'PREVIEW' || activeTab === 'CONSOLE') && (
          <div className={`flex flex-col flex-1 bg-white dark:bg-slate-950 overflow-hidden ${!isMobile ? 'sm:w-1/2' : ''}`}>
            
            {/* Live Preview for HTML and CSS */}
            {(activeLanguage === 'HTML/CSS/JS' || activeLanguage === 'HTML' || activeLanguage === 'CSS') && (!isMobile || activeTab === 'PREVIEW') && (
              <div className={`flex flex-col flex-1 border-b border-slate-200 dark:border-slate-800 ${!isMobile ? 'h-3/5' : 'h-full'}`}>
                <div className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 flex justify-between items-center shrink-0 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LIVE PREVIEW ({activeLanguage})</span>
                  </div>
                  <button 
                    onClick={handleRun}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Refresh
                  </button>
                </div>
                <div className="flex-1 min-h-0 bg-white">
                  {outputHtml ? (
                    <iframe
                      title="preview"
                      srcDoc={outputHtml}
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts allow-modals allow-same-origin"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                      <Play className="w-6 h-6 text-blue-500 opacity-60" />
                      <span>Click <b>Run</b> to generate live preview</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Console Output */}
            {(!isMobile || activeTab === 'CONSOLE') && (
              <div className={`flex flex-col bg-[#0d1117] text-slate-300 ${(!isMobile && (activeLanguage === 'HTML/CSS/JS' || activeLanguage === 'HTML' || activeLanguage === 'CSS')) ? 'h-2/5 border-t border-slate-800' : 'flex-1'}`}>
                <div className="bg-[#010409] px-4 py-2 text-xs font-bold flex items-center justify-between text-slate-400 shrink-0 border-b border-slate-800/80 shadow-sm select-none">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="tracking-widest">OUTPUT CONSOLE</span>
                  </div>
                  {consoleOutput.length > 0 && (
                    <button 
                      onClick={() => setConsoleOutput([])}
                      className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
                  {consoleOutput.length > 0 ? (
                    consoleOutput.map((line, i) => (
                      <div key={i} className={`mb-1 break-words ${line.startsWith('[ERROR]') || line.startsWith('Error:') ? 'text-red-400 font-semibold' : line.startsWith('[WARN]') ? 'text-yellow-400' : line.startsWith('$') ? 'text-blue-400 font-bold mb-2' : line.startsWith('✓') ? 'text-emerald-400 font-semibold' : 'text-slate-200'}`}>
                        {line}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 italic">Ready for execution. Click "Run" to execute your {activeLanguage} code and view output here...</div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
