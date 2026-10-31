import { PracticeModule, TypingLesson, DailyChallenge, Achievement } from '../../types/typing';

export const CATEGORY_TEXTS: Record<string, Record<'beginner' | 'intermediate' | 'advanced', string[]>> = {
  common: {
    beginner: [
      "the quick brown fox jumps over the lazy dog",
      "time and tide wait for no man in this world",
      "every cloud has a silver lining in the sky",
      "actions speak louder than words in every situation",
      "where there is a will there is always a way",
      "honesty is the best policy in life and work"
    ],
    intermediate: [
      "Consistent daily practice is the single most effective way to build muscle memory and typing confidence.",
      "Reading the words slightly ahead of your fingers helps maintain a continuous, uninterrupted flow of keystrokes.",
      "Keep your wrists elevated and relaxed above the keyboard rather than resting heavily against the desk edge.",
      "Speed is a natural byproduct of accuracy; focus on flawless rhythm first and velocity will rapidly follow."
    ],
    advanced: [
      "Mastery over the keyboard requires synthesizing tactile finger mechanics with cognitive foresight, transforming abstract thoughts into digital keystrokes without visual hesitation.",
      "The ergonomic harmony between posture, wrist orientation, and consistent finger placement prevents repetitive strain while enabling effortless sustained velocity throughout intensive sessions."
    ]
  },
  sentences: {
    beginner: [
      "The morning sun cast a warm golden light across the quiet park.",
      "A gentle breeze rustled the green leaves of the tall oak trees.",
      "Clear water flowed smoothly over the smooth river stones below.",
      "Birds sang cheerful melodies as the new day began to unfold."
    ],
    intermediate: [
      "The library was filled with the quiet murmur of turning pages and the steady hum of focused concentration.",
      "Curiosity and perseverance are the dual engines that propel scientific discovery across generations.",
      "Effective communication bridges misunderstandings and transforms complex challenges into collaborative achievements."
    ],
    advanced: [
      "Beneath the starlit expanse of the observatory dome, astronomers deciphered subtle electromagnetic signals originating billions of light-years across the observable cosmos.",
      "Philosophical inquiry challenges fundamental assumptions, encouraging us to perceive nuanced interconnections between human consciousness and technological evolution."
    ]
  },
  college: {
    beginner: [
      "Higher education cultivates analytical reasoning and critical inquiry.",
      "Students gather in seminar halls to debate historical perspectives.",
      "Academic integrity requires honest citations and original contributions.",
      "Collaborative research projects foster teamwork and intellectual growth."
    ],
    intermediate: [
      "Interdisciplinary coursework combines theoretical foundations with empirical research methodologies to analyze complex modern phenomena.",
      "The synthesis of quantitative data and qualitative observations provides a comprehensive perspective on socioeconomic trends.",
      "Comprehensive literature reviews establish the historical context necessary for proposing novel empirical hypotheses."
    ],
    advanced: [
      "Epistemological frameworks underpin scientific methodology, establishing systematic protocols to validate empirical hypotheses against observational discrepancies.",
      "Scholastic discourse flourishes when divergent intellectual paradigms engage in rigorous peer-reviewed evaluation, advancing collective understanding."
    ]
  },
  computer_it: {
    beginner: [
      "An operating system manages hardware memory and process scheduling.",
      "Data structures like arrays and stacks store information sequentially.",
      "Computer networks transmit information using the internet protocol suite.",
      "Central processing units execute instructions in sequential clock cycles."
    ],
    intermediate: [
      "Relational databases enforce transactional integrity through atomicity, consistency, isolation, and durability guarantees.",
      "Virtual memory architecture maps contiguous virtual address spaces to fragmented physical random-access memory frames.",
      "Asynchronous non-blocking event loops enable single-threaded servers to handle thousands of concurrent client connections."
    ],
    advanced: [
      "Distributed consensus algorithms like Raft and Paxos ensure fault-tolerant state machine replication across unreliable asynchronous networks with Byzantine failure mitigation.",
      "Modern microarchitectures leverage speculative branch prediction, out-of-order execution pipelines, and multi-tier cache hierarchies to minimize instruction latency."
    ]
  },
  programming: {
    beginner: [
      "const count = 10; for (let i = 0; i < count; i++) console.log(i);",
      "function add(a: number, b: number): number { return a + b; }",
      "import React, { useState, useEffect } from 'react';",
      "SELECT id, username, email FROM users WHERE active = true;"
    ],
    intermediate: [
      "const memoizedValue = useMemo(() => computeHeavyMatrix(data), [data]);",
      "public static void main(String[] args) { System.out.println(\"System Online\"); }",
      "git commit -m \"refactor(engine): optimize keystroke buffering pipeline\"",
      "const { data, error } = await supabase.from('sessions').select('*');"
    ],
    advanced: [
      "export type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };",
      "template <typename T> class ThreadSafeQueue { private: std::mutex mtx; std::queue<T> data; };",
      "docker run -d -p 8080:8080 --name app_cluster --restart always node:22-alpine",
      "fn binary_search<T: Ord>(slice: &[T], target: &T) -> Result<usize, usize> { slice.binary_search(target) }"
    ]
  },
  business: {
    beginner: [
      "Please review the attached project agenda before our morning meeting.",
      "Our team completed the client deliverables two days ahead of schedule.",
      "Customer satisfaction remains the primary metric for organizational growth.",
      "Clear communication ensures alignment across cross-functional teams."
    ],
    intermediate: [
      "Quarterly performance reviews demonstrated sustained revenue expansion driven by enterprise customer acquisitions.",
      "Strategic resource allocation prioritizes core infrastructure investments to enhance operational resilience and market agility.",
      "The executive board approved the new product roadmap with emphasis on automated workflow optimization."
    ],
    advanced: [
      "Optimizing global supply chain logistics requires real-time predictive analytics to mitigate geopolitical volatility and inventory discrepancies across international distribution hubs.",
      "Enterprise digital transformation necessitates aligning change-management protocols with agile governance models to accelerate time-to-market."
    ]
  },
  knowledge: {
    beginner: [
      "The Pacific Ocean is the largest and deepest water body on Earth.",
      "Photosynthesis converts sunlight, water, and carbon dioxide into oxygen.",
      "The solar system consists of eight planets revolving around the Sun.",
      "DNA carries the genetic instructions for the development of all living organisms."
    ],
    intermediate: [
      "James Webb Space Telescope captures infrared signatures revealing the formation of the universe's earliest cosmological galaxies.",
      "Plate tectonics explains the dynamic movement of Earth's lithospheric plates, shaping mountain ranges and deep ocean trenches.",
      "Renewable energy systems harness solar photovoltaics and wind turbines to diminish reliance on fossil fuel combustion."
    ],
    advanced: [
      "General relativity describes gravitation not as a traditional mechanical force, but as the geometric curvature of four-dimensional spacetime induced by mass and energy distribution.",
      "Thermodynamic entropy dictates that within any isolated macroscopic system, the natural progression of irreversible processes perpetually increases total disorder over time."
    ]
  }
};

// 15 Complete Practice Modules
export const PRACTICE_MODULES: PracticeModule[] = [
  {
    id: 'm1_beginner',
    title: 'Beginner Typing',
    description: 'Master keyboard ergonomics, gentle touch-typing rhythm, and simple 3-4 letter words.',
    category: 'foundation',
    difficulty: 'beginner',
    estimatedDuration: '2 mins',
    tags: ['Basics', 'Slow Pace', 'Posture'],
    icon: 'Feather',
    content: [
      'cat dog sun red big run hop sit map pen cup hat fox box pig'
    ]
  },
  {
    id: 'm2_home_row',
    title: 'Home Row Practice',
    description: 'Anchor your fingers on ASDF and JKL; keys to establish permanent muscle memory.',
    category: 'foundation',
    difficulty: 'beginner',
    estimatedDuration: '3 mins',
    tags: ['ASDF', 'JKL;', 'Home Row'],
    icon: 'Anchor',
    content: [
      'asdf jkl; asdf jkl; a s d f j k l ; dad sad fad lad salad flask fall flash'
    ]
  },
  {
    id: 'm3_top_row',
    title: 'Top Row Practice',
    description: 'Learn upward finger extensions toward QWERTY and UIOP keys with minimal hand lift.',
    category: 'foundation',
    difficulty: 'beginner',
    estimatedDuration: '3 mins',
    tags: ['QWERTY', 'UIOP', 'Reach'],
    icon: 'ArrowUp',
    content: [
      'quiet power tower report writer query equate quote outpour pour peer'
    ]
  },
  {
    id: 'm4_bottom_row',
    title: 'Bottom Row Practice',
    description: 'Coordinate downward thumb and finger strikes for ZXCVB and NM,./ keys.',
    category: 'foundation',
    difficulty: 'intermediate',
    estimatedDuration: '3 mins',
    tags: ['ZXCV', 'NM', 'Stretching'],
    icon: 'ArrowDown',
    content: [
      'zebra zoom cave view bike novel mix matrix brave calm vanish zinc voice'
    ]
  },
  {
    id: 'm5_capital_letters',
    title: 'Capital Letters',
    description: 'Master smooth Shift-key synchronization using opposite pinky finger anchors.',
    category: 'foundation',
    difficulty: 'intermediate',
    estimatedDuration: '3 mins',
    tags: ['Shift Key', 'Pinky Finger', 'Capitals'],
    icon: 'Type',
    content: [
      'London Paris Tokyo New York Delhi Berlin Sydney Rome Cairo Toronto'
    ]
  },
  {
    id: 'm6_numbers',
    title: 'Numbers Practice',
    description: 'Precision top-number row navigation without glancing down at the keys.',
    category: 'foundation',
    difficulty: 'intermediate',
    estimatedDuration: '4 mins',
    tags: ['Numbers', '0-9', 'Top Row'],
    icon: 'Hash',
    content: [
      '2026 1998 4096 1024 8192 365 24 60 720 1080 1440 2560 3840 99'
    ]
  },
  {
    id: 'm7_punctuation',
    title: 'Punctuation Practice',
    description: 'Navigate quotes, commas, periods, hyphens, semicolons, and parentheses effortlessly.',
    category: 'foundation',
    difficulty: 'intermediate',
    estimatedDuration: '4 mins',
    tags: ['Symbols', 'Quotes', 'Commas'],
    icon: 'Percent',
    content: [
      'Hello, world! Are you ready? "Practice," she said, "brings mastery." It\'s true; never quit!'
    ]
  },
  {
    id: 'm8_common_words',
    title: 'Common English Words',
    description: 'High-frequency core vocabulary that accounts for over 50% of everyday writing.',
    category: 'vocabulary',
    difficulty: 'beginner',
    estimatedDuration: '3 mins',
    tags: ['Top Words', 'Frequency', 'Speed'],
    icon: 'BookOpen',
    content: [
      'the about other which their would write could people water first think after right'
    ]
  },
  {
    id: 'm9_misspelled',
    title: 'Frequently Misspelled Words',
    description: 'Drill tricky words with silent letters, double consonants, and irregular vowels.',
    category: 'vocabulary',
    difficulty: 'intermediate',
    estimatedDuration: '4 mins',
    tags: ['Spelling', 'Accuracy', 'Troublesome'],
    icon: 'AlertCircle',
    content: [
      'accommodate necessary separate embarrassment rhythm conscious privilege independent subtle'
    ]
  },
  {
    id: 'm10_sentences',
    title: 'Sentence Practice',
    description: 'Build typing endurance with cohesive English sentences and natural grammar.',
    category: 'sentences',
    difficulty: 'intermediate',
    estimatedDuration: '4 mins',
    tags: ['Sentences', 'Rhythm', 'Flow'],
    icon: 'AlignLeft',
    content: [
      'Every small victory along the way reinforces dedication and transforms potential into demonstrable excellence.'
    ]
  },
  {
    id: 'm11_paragraphs',
    title: 'Paragraph Practice',
    description: 'Long-form continuous typing designed to measure sustained pace and mental focus.',
    category: 'sentences',
    difficulty: 'advanced',
    estimatedDuration: '5 mins',
    tags: ['Endurance', 'Long Form', 'Concentration'],
    icon: 'FileText',
    content: [
      'Great typists do not obsess over raw velocity; instead, they cultivate an effortless cadence where fingers anticipate words ahead of time. Once accuracy stabilizes above ninety-eight percent, remarkable speed unfolds naturally without strain or cognitive fatigue.'
    ]
  },
  {
    id: 'm12_advanced_speed',
    title: 'Advanced Typing',
    description: 'High-intensity burst drills engineered for typists aiming beyond 80+ WPM.',
    category: 'sentences',
    difficulty: 'advanced',
    estimatedDuration: '4 mins',
    tags: ['80+ WPM', 'Burst Speed', 'Pro Level'],
    icon: 'Zap',
    content: [
      'Velocity and precision converge when neuromuscular feedback loops anticipate spatial key coordinates seamlessly.'
    ]
  },
  {
    id: 'm13_college_vocab',
    title: 'College Vocabulary',
    description: 'Elevated academic vocabulary common in university essays and competitive exams.',
    category: 'vocabulary',
    difficulty: 'advanced',
    estimatedDuration: '4 mins',
    tags: ['Collegiate', 'Exams', 'Essay Vocab'],
    icon: 'GraduationCap',
    content: [
      'juxtaposition paradigm serendipity quintessential ephemeral meticulous ubiquitous eloquent comprehensive'
    ]
  },
  {
    id: 'm14_computer_vocab',
    title: 'Computer & IT Vocabulary',
    description: 'Essential terminology for software engineers, BCA/CS students, and IT specialists.',
    category: 'technical',
    difficulty: 'intermediate',
    estimatedDuration: '4 mins',
    tags: ['IT Terms', 'Hardware', 'Software'],
    icon: 'Cpu',
    content: [
      'microprocessor kernel virtualization bandwidth concurrency deadlock encryption latency throughput'
    ]
  },
  {
    id: 'm15_programming_terms',
    title: 'Programming Terms',
    description: 'Real coding symbols, camelCase variables, brackets, and language keywords.',
    category: 'technical',
    difficulty: 'advanced',
    estimatedDuration: '5 mins',
    tags: ['Code', 'Syntax', 'Brackets'],
    icon: 'Code2',
    content: [
      'const handleSubmit = async (event: FormEvent) => { event.preventDefault(); await api.sync(); };'
    ]
  }
];

// 5 Structured Learning Levels
export const STRUCTURED_LESSONS: TypingLesson[] = [
  {
    id: 'lvl_1',
    level: 1,
    levelTitle: 'Level 1: Getting Started',
    title: 'Ergonomics & Home Row Fundamentals',
    description: 'Learn foundational finger placement, posture, and anchor positions on ASDF and JKL; keys.',
    steps: [
      {
        id: 'l1_s1',
        title: 'Home Row Anchor Position',
        instruction: 'Place your left index finger on F (feel the tactile bump) and right index finger on J. Rest remaining fingers lightly on ASDF and JKL;.',
        targetText: 'asdf jkl; asdf jkl;',
        keyPlacementTips: 'Keep wrists straight and floating; do not rest them against desk corners.'
      },
      {
        id: 'l1_s2',
        title: 'Left Hand Home Row Words',
        instruction: 'Type with left hand fingers only (A with pinky, S with ring, D with middle, F with index).',
        targetText: 'sad fad dad as fads dads',
        keyPlacementTips: 'Light, snappy key taps yield faster rebound than pushing hard.'
      },
      {
        id: 'l1_s3',
        title: 'Right Hand Home Row Words',
        instruction: 'Type with right hand fingers (J with index, K with middle, L with ring, ; with pinky).',
        targetText: 'all fall ask lad salads',
        keyPlacementTips: 'Keep your thumbs resting lightly over the spacebar.'
      }
    ]
  },
  {
    id: 'lvl_2',
    level: 2,
    levelTitle: 'Level 2: Basic Skills',
    title: 'Top & Bottom Row Navigation',
    description: 'Extend upward and downward smoothly without shifting your hand base from the home row.',
    steps: [
      {
        id: 'l2_s1',
        title: 'Reaching Top Row E and I',
        instruction: 'Reach middle fingers upward: Left middle finger reaches D -> E, right middle reaches K -> I.',
        targetText: 'see die lie kid lake like idea silk',
        keyPlacementTips: 'Return immediately to the home row after tapping the top key.'
      },
      {
        id: 'l2_s2',
        title: 'Reaching Bottom Row C and M',
        instruction: 'Left middle finger reaches D -> C, right index reaches J -> M.',
        targetText: 'came make calm mica call mile calm music',
        keyPlacementTips: 'Avoid twisting your entire hand when reaching down.'
      },
      {
        id: 'l2_s3',
        title: 'Full Row Combination',
        instruction: 'Combine home, top, and bottom rows with spacebar cadence.',
        targetText: 'the quick brown fox jumps over a lazy dog',
        keyPlacementTips: 'Maintain an even rhythm rather than rushing easy words.'
      }
    ]
  },
  {
    id: 'lvl_3',
    level: 3,
    levelTitle: 'Level 3: Building Speed',
    title: 'Word Cadence & Rhythm',
    description: 'Transition from letter-by-letter focus to recognizing complete word shapes and syllables.',
    steps: [
      {
        id: 'l3_s1',
        title: 'High Frequency Pairs',
        instruction: 'Type common English bigrams (th, he, in, er, an, re, on, at, en, nd) with fluid timing.',
        targetText: 'the they then there other another stand under',
        keyPlacementTips: 'Scan two to three words ahead to eliminate pauses between keystrokes.'
      },
      {
        id: 'l3_s2',
        title: 'Short Sentence Fluency',
        instruction: 'Maintain continuous speed across complete punctuation pauses.',
        targetText: 'Time moves quickly when you stay focused on continuous improvement.',
        keyPlacementTips: 'Breathe steadily and keep your shoulders relaxed.'
      }
    ]
  },
  {
    id: 'lvl_4',
    level: 4,
    levelTitle: 'Level 4: Improving Accuracy',
    title: 'Punctuation, Capitalization & Error Prevention',
    description: 'Minimize backspaces and build 98%+ precision on complex sentences with mixed symbols.',
    steps: [
      {
        id: 'l4_s1',
        title: 'Opposite-Hand Shift Technique',
        instruction: 'Use left shift for right-hand capitals, and right shift for left-hand capitals.',
        targetText: 'London, Tokyo, Sydney, Paris, and New York host global summits.',
        keyPlacementTips: 'Never reach across the keyboard with the same hand holding Shift.'
      },
      {
        id: 'l4_s2',
        title: 'Precision Punctuation',
        instruction: 'Type quotation marks, commas, hyphens, and apostrophes cleanly without glancing down.',
        targetText: 'It\'s well-known: "Patience and practice create remarkable results!"',
        keyPlacementTips: 'Keep finger curls natural like playing a piano.'
      }
    ]
  },
  {
    id: 'lvl_5',
    level: 5,
    levelTitle: 'Level 5: Advanced Practice',
    title: 'Sustained Endurance & Technical Drills',
    description: 'Prepare for competitive exams, programming benchmarks, and high-speed professional work.',
    steps: [
      {
        id: 'l5_s1',
        title: 'Technical Terminology Drill',
        instruction: 'Type specialized vocabulary with mixed case and technical punctuation.',
        targetText: 'Binary search algorithms operate in logarithmic time complexity: O(log n).',
        keyPlacementTips: 'Treat parentheses and colons as regular extensions.'
      },
      {
        id: 'l5_s2',
        title: 'Two-Minute Endurance Sprint',
        instruction: 'Sustain uninterrupted focus for long-form collegiate prose.',
        targetText: 'Technological advancement accelerates when software architecture, empirical algorithms, and human-centric design align to solve real societal problems.',
        keyPlacementTips: 'Focus strictly on flawless accuracy; velocity will naturally surge.'
      }
    ]
  }
];

// Deterministic date-based daily challenges
export function getDailyChallengeForDate(dateStr?: string): DailyChallenge {
  const d = dateStr ? new Date(dateStr) : new Date();
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const dateKey = d.toISOString().split('T')[0];

  const pool = [
    {
      title: 'One-Minute Accuracy Sprint',
      description: 'Complete 60 seconds with minimum 98% accuracy. Precision is prioritized over raw speed.',
      category: 'Accuracy Focus',
      duration: 60,
      targetAccuracy: 98,
      targetWpm: 45,
      targetText: 'Consistent typing habits built over time outperform sporadic bursts of intense speed. Strive for rhythmic precision and calm mental focus.',
      rules: ['Minimum 98% Accuracy', '1-minute uninterrupted test', 'Zero backspace allowed in hardcore rules']
    },
    {
      title: 'Common Words Velocity Run',
      description: 'Sprint through high-frequency English vocabulary in a rapid 30-second burst.',
      category: 'Speed Burst',
      duration: 30,
      targetAccuracy: 95,
      targetWpm: 55,
      targetText: 'time person year way day thing man world life hand part child eye woman place work week case point government company number group problem fact',
      rules: ['Hit target 55+ WPM', '30-second rapid sprint', 'Word cadence benchmark']
    },
    {
      title: 'Numbers & Symbols Blitz',
      description: 'Navigate top-row numbers, currency signs, and brackets without breaking rhythm.',
      category: 'Technical',
      duration: 45,
      targetAccuracy: 96,
      targetWpm: 40,
      targetText: 'In 2026, 45% of tech teams allocated $12,500 to cloud APIs [v2.4], scaling server throughput from 1,024 to 8,192 requests/sec (99.9% uptime).',
      rules: ['Navigate top row without looking', 'Mixed numbers & brackets', '45-second challenge']
    },
    {
      title: 'Collegiate Endurance Marathon',
      description: 'Two full minutes of continuous academic prose testing sustained mental concentration.',
      category: 'Endurance',
      duration: 120,
      targetAccuracy: 97,
      targetWpm: 50,
      targetText: 'Theoretical frameworks in modern cognitive science suggest that motor learning relies on iterative cerebellar calibration. By practicing typing regularly, neural pathways automate keystroke coordination, reducing conscious cognitive load and allowing typists to focus purely on creative composition.',
      rules: ['Full 120-second stamina test', 'Maintain steady pace', 'Minimum 97% accuracy threshold']
    }
  ];

  const selected = pool[dayOfYear % pool.length];
  return {
    id: `challenge_${dateKey}`,
    dateKey,
    ...selected
  };
}

// Built-in Achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_test',
    title: 'First Keystrokes',
    description: 'Completed your very first typing test on VYRON TYPING.',
    icon: 'Flag',
    maxProgress: 1
  },
  {
    id: 'speed_40',
    title: 'Touch Typist',
    description: 'Surpassed 40 Net WPM on any standard test.',
    icon: 'Zap',
    maxProgress: 40
  },
  {
    id: 'speed_60',
    title: 'Velocity Pro',
    description: 'Achieved 60+ Net WPM speed milestone.',
    icon: 'Flame',
    maxProgress: 60
  },
  {
    id: 'speed_80',
    title: 'Speed Demon',
    description: 'Entered the elite 80+ Net WPM bracket.',
    icon: 'Trophy',
    maxProgress: 80
  },
  {
    id: 'accuracy_100',
    title: 'Flawless Precision',
    description: 'Finished a 30s+ test with 100% accuracy and zero errors.',
    icon: 'Award',
    maxProgress: 1
  },
  {
    id: 'ten_tests',
    title: 'Dedicated Typist',
    description: 'Logged 10 complete typing sessions in your history.',
    icon: 'Activity',
    maxProgress: 10
  },
  {
    id: 'lesson_master',
    title: 'Curriculum Graduate',
    description: 'Completed all steps of Level 1 and Level 2 structured lessons.',
    icon: 'GraduationCap',
    maxProgress: 6
  }
];
