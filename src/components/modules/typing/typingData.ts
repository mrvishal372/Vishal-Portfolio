/**
 * Comprehensive Typing Texts, Quotes, Code Snippets, Exam Passages, and Touch Typing Lessons
 * for VYRON TYPING Platform
 */

export interface TouchTypingLesson {
  id: number;
  title: string;
  category: 'Home Row' | 'Top Row' | 'Bottom Row' | 'Numbers & Symbols' | 'Advanced Flow';
  keys: string[];
  description: string;
  targetWpm: number;
  targetAccuracy: number;
  drills: string[];
}

export const TOUCH_TYPING_LESSONS: TouchTypingLesson[] = [
  {
    id: 1,
    title: 'Home Row Foundations: A S D F',
    category: 'Home Row',
    keys: ['A', 'S', 'D', 'F'],
    description: 'Place your left pinky on A, ring on S, middle on D, and index finger on F.',
    targetWpm: 20,
    targetAccuracy: 95,
    drills: [
      'asdf asdf asdf fdas fdas aass ddff',
      'as as df df fa fa ds ds sa sa af af',
      'fad fads safe deaf daft dads daff sass',
      'a fad fads a safe dad as a fad daff'
    ]
  },
  {
    id: 2,
    title: 'Home Row Right Hand: J K L ;',
    category: 'Home Row',
    keys: ['J', 'K', 'L', ';'],
    description: 'Rest your right index finger on J (feel the bump!), middle on K, ring on L, and pinky on semicolon (;).',
    targetWpm: 22,
    targetAccuracy: 95,
    drills: [
      'jkl; jkl; jkl; ;lkj ;lkj jj kk ll ;;',
      'jk jk kl kl l; l; kj kj lk lk ;l ;l',
      'all fall salad flask ask flask lass salsa',
      'ask a lass; fall as a leaf; flask all salads;'
    ]
  },
  {
    id: 3,
    title: 'Home Row Center Reach: G & H',
    category: 'Home Row',
    keys: ['G', 'H'],
    description: 'Reach your left index to G and return to F. Reach your right index to H and return to J.',
    targetWpm: 25,
    targetAccuracy: 96,
    drills: [
      'fgf fgf jhj jhj gh gh hg hg fgjh jgfh',
      'had glad flash half glass flags dash slag',
      'gash shag shad flag hash gag gala dash fall',
      'half a glass had glad flags; all dashes had flash;'
    ]
  },
  {
    id: 4,
    title: 'Top Row Vowels: E & I',
    category: 'Top Row',
    keys: ['E', 'I'],
    description: 'Reach up from D to E with your left middle finger. Reach up from K to I with your right middle finger.',
    targetWpm: 28,
    targetAccuracy: 96,
    drills: [
      'ded ded kik kik de de ki ki ed ed ik ik',
      'fee see feed kid lid life side slide field',
      'die lie file slide hides ideals leaves files',
      'life is like a field of leaves; side ideas slide free;'
    ]
  },
  {
    id: 5,
    title: 'Top Row Complete: Q W R T Y U O P',
    category: 'Top Row',
    keys: ['Q', 'W', 'R', 'T', 'Y', 'U', 'O', 'P'],
    description: 'Master full upper keyboard reach while keeping your palms relaxed and thumbs near the spacebar.',
    targetWpm: 32,
    targetAccuracy: 95,
    drills: [
      'qwerty uiop poiuy trewq write route quote power',
      'people write reports about their future today',
      'type true pure words with quiet power and pride',
      'our world requires great ideas, bright thoughts, and tireless work.'
    ]
  },
  {
    id: 6,
    title: 'Bottom Row Core: C, V, M, N',
    category: 'Bottom Row',
    keys: ['C', 'V', 'M', 'N'],
    description: 'Reach down with left index to V and C. Reach down with right index to M and N.',
    targetWpm: 30,
    targetAccuracy: 95,
    drills: [
      'fcf fvf jmj jnj cv mn vc nm come move name main',
      'common machine dynamic values modern connection vision',
      'move common values into creative momentum and vision',
      'new machines make creative movements very natural and smooth.'
    ]
  },
  {
    id: 7,
    title: 'Bottom Row Full: Z, X, B, Comma, Period',
    category: 'Bottom Row',
    keys: ['Z', 'X', 'B', ',', '.'],
    description: 'Finish the lower row with pinky on Z, ring on X, index reach to B, and right hand punctuation.',
    targetWpm: 34,
    targetAccuracy: 96,
    drills: [
      'azsx dc fv jm k, l. ;/ box size balance zero next.',
      'exact balance, mixed sizes, quick reflexes, fixed goals.',
      'build next level projects, solve complex puzzles, exceed limits.',
      'the next exciting phase begins with focus, practice, and strong belief.'
    ]
  },
  {
    id: 8,
    title: 'Shift Keys & Proper Capitalization',
    category: 'Advanced Flow',
    keys: ['Shift', 'Caps'],
    description: 'Use the opposite shift key: Left Shift for right-hand letters, Right Shift for left-hand letters.',
    targetWpm: 36,
    targetAccuracy: 96,
    drills: [
      'India Patna Bihar London Tokyo New York Paris Sydney',
      'Python JavaScript Linux Android Windows Apple Google',
      'Alan Turing, Dennis Ritchie, Ada Lovelace, and Linus Torvalds.',
      'Every Journey Begins With Courage, Perseverance, And Dedication.'
    ]
  },
  {
    id: 9,
    title: 'Number Row: 1 2 3 4 5 6 7 8 9 0',
    category: 'Numbers & Symbols',
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    description: 'Reach upward to the numeric row without shifting your hand base off the home row.',
    targetWpm: 30,
    targetAccuracy: 94,
    drills: [
      '123 456 789 0 1024 2048 4096 8192 192 168 0 1',
      'room 404, port 8080, route 66, flight 747, code 9001',
      'in 2026 there were 365 days and over 1000 new software updates.',
      'order #1085: 12 laptops, 24 monitors, and 48 cables for 9500 dollars.'
    ]
  },
  {
    id: 10,
    title: 'Programming Symbols: { } [ ] ( ) < > ; = & |',
    category: 'Numbers & Symbols',
    keys: ['{', '}', '[', ']', '(', ')', '<', '>', ';', '=', '&', '|'],
    description: 'Essential for coders: shift combinations and bracket balance practice.',
    targetWpm: 32,
    targetAccuracy: 95,
    drills: [
      '() [] {} <> && || == != += -= => <= >= ; :',
      'const list = [1, 2, 3]; const obj = { key: "value" };',
      'if (x > 0 && y <= 10) { return (a + b) * c; }',
      'export default function calculate(arr: number[]): boolean { return true; }'
    ]
  },
  {
    id: 11,
    title: 'High-Speed English N-Grams & Flow',
    category: 'Advanced Flow',
    keys: ['tion', 'ing', 'ment', 'ough', 'ould'],
    description: 'Condition your muscle memory to type high-frequency English word patterns as single bursts.',
    targetWpm: 45,
    targetAccuracy: 97,
    drills: [
      'action motion nation option station mention fraction function',
      'running walking jumping testing coding building designing dreaming',
      'development management statement agreement movement requirement',
      'through although thought brought caught sought fought throughout',
      'would should could might right flight bright tight insight delight'
    ]
  },
  {
    id: 12,
    title: 'Computer Science & BCA Technical Velocity',
    category: 'Advanced Flow',
    keys: ['Algorithm', 'Database', 'Binary', 'Object'],
    description: 'Fast technical fluency for engineering interviews, coding tests, and competitive assessments.',
    targetWpm: 50,
    targetAccuracy: 98,
    drills: [
      'An algorithm is a finite sequence of well-defined computer-implementable instructions.',
      'Encapsulation binds together code and data while protecting both from outside misuse.',
      'Relational databases enforce ACID properties to guarantee valid transactions.',
      'Operating systems schedule threads, manage virtual memory, and arbitrate physical I/O devices.'
    ]
  }
];

export const TYPING_QUOTES = [
  {
    text: "Simplicity is prerequisite for reliability. The computing scientist's main challenge is not to get confused by the complexities of his own making.",
    author: "Edsger W. Dijkstra",
    length: "medium"
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    length: "short"
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    length: "medium"
  },
  {
    text: "The function of good software is to make the complex appear simple. The goal is not just working software, but craftsmanship that inspires others.",
    author: "Grady Booch",
    length: "medium"
  },
  {
    text: "Stay hungry, stay foolish. Your time is limited, so don't waste it living someone else's life. Have the courage to follow your heart and intuition.",
    author: "Steve Jobs",
    length: "medium"
  },
  {
    text: "We can only see a short distance ahead, but we can see plenty there that needs to be done. Machines take me by surprise with great frequency.",
    author: "Alan Turing",
    length: "medium"
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever. Success is the sum of small efforts repeated day in and day out.",
    author: "Mahatma Gandhi",
    length: "medium"
  },
  {
    text: "Arise, awake, and stop not till the goal is reached. All power is within you; you can do anything and everything. Believe in that.",
    author: "Swami Vivekananda",
    length: "medium"
  },
  {
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Do not settle. In typing as in life, steady rhythm creates speed.",
    author: "Vyron Wisdom",
    length: "medium"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad. Focus on clarity, consistent naming, and intentional structure every single day.",
    author: "Cory House",
    length: "short"
  }
];

export const TYPING_CODE_SNIPPETS = [
  {
    language: 'JavaScript / TypeScript',
    name: 'React Custom Hook',
    code: `const useDebounce = <T,>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};`
  },
  {
    language: 'Python',
    name: 'Fibonacci Generator',
    code: `def fibonacci_stream(limit: int):
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b

evens = [x for x in fibonacci_stream(25) if x % 2 == 0]
print(f"Computed {len(evens)} even Fibonacci numbers")`
  },
  {
    language: 'C++',
    name: 'Binary Search Implementation',
    code: `int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = static_cast<int>(arr.size()) - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
  },
  {
    language: 'SQL',
    name: 'Aggregated Performance Query',
    code: `SELECT u.id, u.full_name, AVG(t.net_wpm) AS average_wpm,
       MAX(t.net_wpm) AS top_speed, COUNT(t.id) AS tests_completed
FROM users u
INNER JOIN typing_records t ON u.id = t.user_id
WHERE t.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.full_name
HAVING COUNT(t.id) >= 10
ORDER BY top_speed DESC
LIMIT 50;`
  },
  {
    language: 'Java',
    name: 'Thread Safe Singleton',
    code: `public final class DatabasePool {
    private static volatile DatabasePool instance;
    private DatabasePool() {}
    public static DatabasePool getInstance() {
        if (instance == null) {
            synchronized (DatabasePool.class) {
                if (instance == null) {
                    instance = new DatabasePool();
                }
            }
        }
        return instance;
    }
}`
  }
];

export const EXAM_PASSAGES = [
  {
    id: 'ssc_exam_1',
    title: 'SSC CGL / CHSL Standard Typing Passage',
    examType: 'SSC / Staff Selection Commission',
    durationSeconds: 900, // 15 min standard or configurable
    shortDurationSeconds: 300, // 5 min sprint
    targetWpm: 35,
    minAccuracy: 95,
    passage: `Education plays a paramount role in the socio-economic transformation of any modern nation. In India, the rapid expansion of information technology and digital governance has redefined public administration. Citizens across rural and urban landscapes now access government entitlements, direct benefit transfers, and essential healthcare services through digital portals. To sustain this momentum, educational institutions must foster practical problem-solving capabilities, logical reasoning, and linguistic precision among young learners. The digital era demands that students not only consume technology but also build innovative solutions that solve grassroots challenges. Equal access to quality education, broadband connectivity, and vocational training forms the cornerstone of an inclusive democracy. When young minds are empowered with ethical leadership and digital competence, the nation accelerates toward self-reliance, innovation, and global leadership.`
  },
  {
    id: 'banking_exam_1',
    title: 'Banking & Financial Clerk Typing Assessment',
    examType: 'Banking / IBPS / RBI',
    durationSeconds: 600, // 10 min
    shortDurationSeconds: 180, // 3 min
    targetWpm: 30,
    minAccuracy: 95,
    passage: `The Indian banking sector has witnessed unprecedented technological innovation over the past decade. The adoption of Unified Payments Interface, real-time gross settlement systems, and artificial intelligence-driven fraud detection engines has simplified financial transactions for millions of citizens. Micro, small, and medium enterprises now secure credit through algorithmic appraisal mechanisms that examine cash flow statements rather than relying solely on traditional collateral. Commercial banks must maintain rigorous compliance with capital adequacy norms, risk mitigation frameworks, and anti-money laundering protocols. Sound credit assessment combined with rapid digital delivery guarantees institutional stability and shields the economy against unexpected macroeconomic fluctuations. Financial inclusion remains central to sustainable development, ensuring that credit reaches agricultural farmers, rural artisans, and aspiring entrepreneurs.`
  },
  {
    id: 'bca_technical_exam',
    title: 'BCA / Computer Science Semester Speed Test',
    examType: 'University / Technical Assessment',
    durationSeconds: 300, // 5 min
    shortDurationSeconds: 120, // 2 min
    targetWpm: 40,
    minAccuracy: 96,
    passage: `An Operating System acts as an intermediary between the computer hardware and user applications. Its primary responsibilities encompass processor scheduling, memory management, file systems, device drivers, and security arbitration. In modern multi-core computing architectures, the kernel schedules multiple concurrent threads using sophisticated scheduling algorithms such as Round Robin, Priority-based Scheduling, and Multilevel Feedback Queues. Virtual memory mechanisms leverage paging and segmentation to map logical address spaces onto physical random-access memory, swapping inactive pages to disk storage when physical capacity is exhausted. Meanwhile, relational database management systems utilize indexing structures like B-Trees and Hash Maps to optimize query execution latency, adhering strictly to Atomicity, Consistency, Isolation, and Durability principles for mission-critical enterprise transactions.`
  },
  {
    id: 'sprint_exam',
    title: '1-Minute Lightning Accuracy Sprint',
    examType: 'Speed Sprint',
    durationSeconds: 60,
    shortDurationSeconds: 60,
    targetWpm: 45,
    minAccuracy: 97,
    passage: `Continuous practice with the correct finger positions transforms keyboarding into second nature. Keep your eyes on the screen, maintain an upright posture, and allow your fingers to float effortlessly over the home row keys. Speed follows naturally from precision.`
  }
];

export const WORD_COLLECTIONS = {
  common200: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
  ],
  techTerms: [
    "system", "program", "compile", "execute", "database", "network", "server", "client",
    "software", "hardware", "function", "variable", "boolean", "integer", "string", "array",
    "algorithm", "structure", "pointer", "memory", "storage", "thread", "process", "kernel",
    "interface", "protocol", "security", "firewall", "router", "gateway", "backend", "frontend",
    "component", "render", "deploy", "pipeline", "docker", "cloud", "packet", "terminal"
  ],
  bcaCore: [
    "cimage", "patna", "vishal", "operating", "systems", "normalization", "relational",
    "inheritance", "polymorphism", "encapsulation", "abstraction", "compiler", "interpreter",
    "multithreading", "asynchronous", "binary", "hexadecimal", "ethernet", "topology"
  ]
};

export const TYPING_WORDS = WORD_COLLECTIONS.common200.concat(WORD_COLLECTIONS.techTerms);

export const TYPING_CODE = [
  "const a = 10;", 
  "let b = 'hello';", 
  "function run() {}", 
  "return true;", 
  "if (x === y)", 
  "array.map(x => x * 2);",
  "console.log('BCA');",
  "import React from 'react';",
  "SELECT * FROM users;",
  "public static void main(String[] args) {}"
];

export const TYPING_TEXTS = {
  beginner: [
    "the cat sat on the mat",
    "a quick brown fox",
    "hello world",
    "good morning",
    "have a nice day",
    "simple easy words",
    "just type this",
    "water is life",
    "sky is blue",
    "green grass",
    "happy days are here",
    "sun shines bright"
  ],
  intermediate: [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "Practice makes perfect when you are learning to type fast.",
    "Keyboarding is an essential skill in the modern digital age.",
    "Consistency is the key to improving your typing speed and accuracy.",
    "Look at the screen while typing, not down at your fingers.",
    "Typing tests are a great way to measure your progressive growth."
  ],
  advanced: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Technology is best when it brings people together, rather than separating them.",
    "The Internet of Things (IoT) describes the network of physical objects embedded with sensors.",
    "Artificial intelligence is transforming industries and reshaping the future of work.",
    "Cloud computing allows users to access applications and data from anywhere in the world.",
    "Cybersecurity protocols are critically important for protecting sensitive digital information."
  ],
  expert: [
    "function calculateWPM(chars, time) { return Math.round((chars / 5) / (time / 60)); }",
    "const observer = new IntersectionObserver((entries) => { entries.forEach(e => console.log(e)); });",
    "Regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/",
    "git commit -m \"fix(core): resolve race condition in state management update loop\"",
    "SELECT users.id, COUNT(orders.id) AS total_orders FROM users LEFT JOIN orders ON users.id = orders.user_id GROUP BY users.id HAVING COUNT(orders.id) > 10;"
  ],
  bca: [
    "BCA stands for Bachelor of Computer Applications.",
    "An operating system is system software that manages computer hardware and software resources.",
    "C programming language was developed by Dennis Ritchie at Bell Labs.",
    "Object-Oriented Programming (OOP) concepts include Inheritance, Polymorphism, Encapsulation, and Abstraction.",
    "System Analysis and Design (SAD) is a step-by-step process for developing high-quality information systems.",
    "Software Development Life Cycle (SDLC) includes phases like planning, analysis, design, implementation, and maintenance.",
    "A Database Management System (DBMS) allows users to create, read, update, and delete data in a database.",
    "Structured Query Language (SQL) is used to communicate with a database.",
    "Data structures like Arrays, Linked Lists, Stacks, and Queues are fundamental for organizing data efficiently.",
    "HTML is the standard markup language for documents designed to be displayed in a web browser.",
    "CSS is used for describing the presentation of a document written in HTML.",
    "JavaScript is a high-level, often just-in-time compiled language that conforms to the ECMAScript standard.",
    "Computer networks allow nodes to share resources and communicate with each other.",
    "The OSI model has seven layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.",
    "A binary search tree is a rooted binary tree data structure with the key of each internal node being greater than all keys in the respective node's left subtree.",
    "Deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.",
    "Virtual memory is a memory management capability of an OS that uses hardware and software to allow a computer to compensate for physical memory shortages.",
    "In relational databases, normalization is the process of structuring a database to reduce data redundancy and improve data integrity."
  ]
};
