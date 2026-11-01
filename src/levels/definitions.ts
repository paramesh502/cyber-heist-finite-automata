import type { Level } from './types';

// ============================================================
// All 8 Game Levels — Mathematically verified automata
// ============================================================

export const LEVELS: Level[] = [
  // ──────────────────────────────────────────────
  // LEVEL 1 — Reconnaissance (Basic DFA)
  // Accepts strings over {a,b} that start with 'a'
  // ──────────────────────────────────────────────
  {
    id: 1,
    title: 'Reconnaissance',
    subtitle: 'Learn the Layout',
    difficulty: 'Rookie',
    concept: 'Basic DFA and state transitions',
    objective: 'Understand how a DFA works by navigating its states one symbol at a time.',
    instructions:
      'This vault uses a simple DFA over the alphabet {a, b}. It accepts any string that starts with the letter "a". Enter symbols one at a time and watch the automaton move between states.',
    automaton: {
      id: 'dfa-level1',
      type: 'DFA',
      description: 'Accepts strings over {a,b} that begin with "a".',
      alphabet: ['a', 'b'],
      states: [
        { id: 'q0', label: 'q0', x: 20, y: 50 },
        { id: 'q1', label: 'q1', x: 50, y: 50 },
        { id: 'q2', label: 'q2', x: 80, y: 50 },
      ],
      initialState: 'q0',
      acceptingStates: ['q1'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: 'a' },
        { from: 'q0', to: 'q2', symbol: 'b' },
        { from: 'q1', to: 'q1', symbol: 'a' },
        { from: 'q1', to: 'q1', symbol: 'b' },
        { from: 'q2', to: 'q2', symbol: 'a' },
        { from: 'q2', to: 'q2', symbol: 'b' },
      ],
    },
    testCases: [
      { input: 'a', expected: true, explanation: 'Single "a" → moves to accepting q1.' },
      { input: 'ab', expected: true, explanation: '"ab" → q0 →a→ q1 →b→ q1 (accepting).' },
      { input: 'aba', expected: true, explanation: 'Starts with "a", stays in q1.' },
      { input: 'b', expected: false, explanation: '"b" → moves to dead state q2.' },
      { input: 'ba', expected: false, explanation: 'Starts with "b" → dead state q2.' },
      { input: '', expected: false, explanation: 'Empty string: stays in q0, not accepting.' },
    ],
    hints: [
      { order: 1, text: 'Look at the initial state q0. What happens when you enter "a"?' },
      { order: 2, text: 'q1 is the accepting (double-circle) state. Can you reach it?' },
      { order: 3, text: 'Any string starting with "a" reaches q1 and never leaves.' },
    ],
    unlockAfter: null,
    explanation: {
      conceptDescription:
        'A Deterministic Finite Automaton (DFA) is a machine that reads input symbols one at a time and deterministically moves between states. Each state represents a stage of computation.',
      automatonExplanation:
        'This DFA has 3 states: q0 (start), q1 (accept), and q2 (dead/trap). Reading "a" from q0 goes to q1; reading "b" goes to q2. q1 loops on both symbols, and q2 also loops — once you reach q2, you are stuck.',
      howToRead:
        'Single arrow = initial state. Double circle = accepting state. Labels on arrows = input symbols.',
      acceptedExample: {
        input: 'ab',
        why: 'q0 →a→ q1 →b→ q1. Final state q1 is accepting. ✓',
      },
      rejectedExample: {
        input: 'ba',
        why: 'q0 →b→ q2 →a→ q2. Final state q2 is not accepting. ✗',
      },
      takeaway: 'A DFA\'s behavior is fully determined by its current state and the next input symbol.',
    },
  },

  // ──────────────────────────────────────────────
  // LEVEL 2 — Binary Access Code
  // DFA accepts binary strings ending in "01"
  // ──────────────────────────────────────────────
  {
    id: 2,
    title: 'Binary Access Code',
    subtitle: 'Crack the Binary Lock',
    difficulty: 'Rookie',
    concept: 'DFA accepting binary strings ending in "01"',
    objective: 'Find binary strings that end in "01" to unlock the vault.',
    instructions:
      'The vault accepts binary strings (over {0,1}) that end with the pattern "01". Enter your access code and see if the automaton accepts it.',
    automaton: {
      id: 'dfa-level2',
      type: 'DFA',
      description: 'Accepts binary strings ending in "01".',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 15, y: 50 },
        { id: 'q1', label: 'q1', x: 50, y: 50 },
        { id: 'q2', label: 'q2', x: 85, y: 50 },
      ],
      initialState: 'q0',
      acceptingStates: ['q2'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q1', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q2', symbol: '1' },
        { from: 'q2', to: 'q1', symbol: '0' },
        { from: 'q2', to: 'q0', symbol: '1' },
      ],
    },
    testCases: [
      { input: '01', expected: true, explanation: 'q0→0→q1→1→q2. Accepted.' },
      { input: '101', expected: true, explanation: 'q0→1→q0→0→q1→1→q2. Accepted.' },
      { input: '1101', expected: true, explanation: 'Ends in "01". Accepted.' },
      { input: '10', expected: false, explanation: 'Ends in "0" (q1). Not accepted.' },
      { input: '111', expected: false, explanation: 'Stays in q0. Not accepted.' },
      { input: '0', expected: false, explanation: 'Ends in q1. Not accepted.' },
      { input: '010', expected: false, explanation: 'Ends in q1. Not accepted.' },
      { input: '', expected: false, explanation: 'Empty string stays in q0.' },
    ],
    hints: [
      { order: 1, text: 'The automaton must end in state q2. What gets you to q2?' },
      { order: 2, text: 'q2 is reached only from q1 on input "1". And q1 is reached from q0 on "0".' },
      { order: 3, text: 'Any string ending in "01" will end in state q2. Try "01", "101", or "1101".' },
    ],
    unlockAfter: 1,
    explanation: {
      conceptDescription:
        'DFAs can recognize patterns inside strings, not just at the beginning. This automaton tracks whether the last two characters form the suffix "01".',
      automatonExplanation:
        'q0 = haven\'t seen "0" yet (or just saw "1" after "01"). q1 = last char was "0". q2 = last two chars were "01" (accepting).',
      howToRead:
        'Follow each arrow for each input symbol. The state after consuming all symbols determines acceptance.',
      acceptedExample: {
        input: '1101',
        why: 'q0→1→q0→1→q0→0→q1→1→q2. Final state q2 is accepting. ✓',
      },
      rejectedExample: {
        input: '010',
        why: 'q0→0→q1→1→q2→0→q1. Ends in q1, not accepting. ✗',
      },
      takeaway: 'DFAs can encode memory about the recent history of the input using states.',
    },
  },

  // ──────────────────────────────────────────────
  // LEVEL 3 — Parity Breach
  // DFA accepts binary strings with even number of 1s
  // ──────────────────────────────────────────────
  {
    id: 3,
    title: 'Parity Breach',
    subtitle: 'Even the Odds',
    difficulty: 'Hacker',
    concept: 'DFA recognizing binary strings with an even number of 1s',
    objective: 'Find a string where the number of "1" bits is even (including zero).',
    instructions:
      'This vault counts the parity of 1s. It accepts binary strings where the total number of "1"s is even (0, 2, 4, ...). Each state tracks whether the count is even or odd.',
    automaton: {
      id: 'dfa-level3',
      type: 'DFA',
      description: 'Accepts binary strings containing an even number of 1s.',
      alphabet: ['0', '1'],
      states: [
        { id: 'even', label: 'even', x: 30, y: 50 },
        { id: 'odd', label: 'odd', x: 70, y: 50 },
      ],
      initialState: 'even',
      acceptingStates: ['even'],
      transitions: [
        { from: 'even', to: 'even', symbol: '0' },
        { from: 'even', to: 'odd', symbol: '1' },
        { from: 'odd', to: 'odd', symbol: '0' },
        { from: 'odd', to: 'even', symbol: '1' },
      ],
    },
    testCases: [
      { input: '', expected: true, explanation: 'Zero 1s is even. Stays in "even" state.' },
      { input: '0', expected: true, explanation: 'Zero 1s. Accepted.' },
      { input: '00', expected: true, explanation: 'Zero 1s. Accepted.' },
      { input: '11', expected: true, explanation: 'Two 1s (even). Accepted.' },
      { input: '1010', expected: true, explanation: 'Two 1s. Accepted.' },
      { input: '1100', expected: true, explanation: 'Two 1s. Accepted.' },
      { input: '1', expected: false, explanation: 'One 1 (odd). Rejected.' },
      { input: '10', expected: false, explanation: 'One 1 (odd). Rejected.' },
      { input: '111', expected: false, explanation: 'Three 1s (odd). Rejected.' },
    ],
    hints: [
      { order: 1, text: 'Notice that reading "0" never changes the parity state.' },
      { order: 2, text: 'Each "1" flips you between even and odd states.' },
      { order: 3, text: 'The empty string "" has zero 1s — zero is even, so it is accepted!' },
    ],
    unlockAfter: 2,
    explanation: {
      conceptDescription:
        'Parity is whether a count is even or odd. This DFA uses exactly 2 states to track parity, demonstrating that states can encode abstract properties.',
      automatonExplanation:
        '"even" state = even number of 1s seen so far (initially 0). "odd" state = odd number of 1s. Reading "0" stays in current state. Reading "1" flips states.',
      howToRead:
        '"even" is both the start and accepting state. Self-loops on "0" mean 0s are ignored for parity.',
      acceptedExample: {
        input: '1010',
        why: 'even→1→odd→0→odd→1→even→0→even. Two 1s seen. Final state "even" is accepting. ✓',
      },
      rejectedExample: {
        input: '111',
        why: 'even→1→odd→1→even→1→odd. Three 1s. Final state "odd" is not accepting. ✗',
      },
      takeaway: 'Two states are sufficient to track parity — a powerful demonstration of DFA expressiveness.',
    },
  },

  // ──────────────────────────────────────────────
  // LEVEL 4 — Pattern Recognition
  // DFA accepts binary strings containing substring "101"
  // ──────────────────────────────────────────────
  {
    id: 4,
    title: 'Pattern Recognition',
    subtitle: 'Find the Hidden Code',
    difficulty: 'Hacker',
    concept: 'DFA recognizing binary strings containing the substring "101"',
    objective: 'Enter a binary string that contains the pattern "101" somewhere in it.',
    instructions:
      'The vault security pattern is "101". Any string over {0,1} that contains this substring will be accepted. The automaton tracks how far you are from completing the pattern.',
    automaton: {
      id: 'dfa-level4',
      type: 'DFA',
      description: 'Accepts binary strings containing the substring "101".',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 15, y: 50 },
        { id: 'q1', label: 'q1', x: 38, y: 50 },
        { id: 'q2', label: 'q2', x: 61, y: 50 },
        { id: 'q3', label: 'q3', x: 84, y: 50 },
      ],
      initialState: 'q0',
      acceptingStates: ['q3'],
      transitions: [
        // q0: no progress
        { from: 'q0', to: 'q1', symbol: '1' },
        { from: 'q0', to: 'q0', symbol: '0' },
        // q1: seen "1"
        { from: 'q1', to: 'q1', symbol: '1' },
        { from: 'q1', to: 'q2', symbol: '0' },
        // q2: seen "10"
        { from: 'q2', to: 'q3', symbol: '1' },
        { from: 'q2', to: 'q0', symbol: '0' },
        // q3: seen "101" — accepting, stay here
        { from: 'q3', to: 'q3', symbol: '0' },
        { from: 'q3', to: 'q3', symbol: '1' },
      ],
    },
    testCases: [
      { input: '101', expected: true, explanation: 'Direct match.' },
      { input: '1101', expected: true, explanation: 'Contains "101" starting at index 1.' },
      { input: '0101', expected: true, explanation: 'Contains "101" starting at index 1.' },
      { input: '10101', expected: true, explanation: 'Multiple occurrences.' },
      { input: '1001', expected: false, explanation: 'Does not contain "101".' },
      { input: '000', expected: false, explanation: 'Does not contain "101".' },
      { input: '11', expected: false, explanation: 'Pattern incomplete.' },
      { input: '10', expected: false, explanation: 'Pattern incomplete.' },
    ],
    hints: [
      { order: 1, text: 'You need "1" then "0" then "1" in sequence. Try "101" directly.' },
      { order: 2, text: 'q0=start, q1=seen "1", q2=seen "10", q3=seen "101" (vault open!).' },
      { order: 3, text: 'Once q3 is reached, you stay there — the vault is unlocked regardless of remaining symbols.' },
    ],
    unlockAfter: 3,
    explanation: {
      conceptDescription:
        'Substring recognition is a fundamental DFA use case. The automaton tracks progress toward matching a target pattern, resetting only when necessary.',
      automatonExplanation:
        'Each state encodes how much of "101" has been matched. q3 is a sink accepting state — once "101" is found, the vault is permanently open.',
      howToRead:
        'Think of each state as a progress bar: q0=0%, q1=33%, q2=66%, q3=100% (match found).',
      acceptedExample: {
        input: '0101',
        why: 'q0→0→q0→1→q1→0→q2→1→q3. Pattern "101" found. ✓',
      },
      rejectedExample: {
        input: '1001',
        why: 'q0→1→q1→0→q2→0→q0→1→q1. Never reaches q3. Pattern not found. ✗',
      },
      takeaway: 'DFAs handle substring matching by carefully managing partial-match state on reset transitions.',
    },
  },

  // ──────────────────────────────────────────────
  // LEVEL 5 — The Nondeterministic Vault
  // NFA: accepts strings ending in "1" or beginning with "0"
  // ──────────────────────────────────────────────
  {
    id: 5,
    title: 'The Nondeterministic Vault',
    subtitle: 'Multiple Paths, One Answer',
    difficulty: 'Elite',
    concept: 'NFA execution — multiple simultaneous active states',
    objective:
      'Enter a string that this NFA accepts. Watch all active states simultaneously.',
    instructions:
      'This vault uses a Nondeterministic Finite Automaton (NFA). At each step, multiple transitions may be possible. The string is accepted if ANY possible execution path ends in an accepting state. The automaton accepts strings that end in "1" OR start with "0".',
    automaton: {
      id: 'nfa-level5',
      type: 'NFA',
      description: 'Accepts strings over {0,1} that end in "1" or start with "0".',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 12, y: 50 },
        // Branch A: starts with 0 → q1 is accepting, loops on both
        { id: 'q1', label: 'q1', x: 42, y: 25 },
        // Branch B: ends with 1 → track last char
        { id: 'q2', label: 'q2', x: 42, y: 75 },
        { id: 'q3', label: 'q3', x: 72, y: 75 },
        { id: 'q4', label: 'q4', x: 88, y: 50 },
      ],
      initialState: 'q0',
      acceptingStates: ['q1', 'q4'],
      transitions: [
        // Branch A: if first symbol is '0', go to accepting q1 (loops)
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q1', symbol: '1' },
        // Branch B: track last symbol for "ends in 1"
        { from: 'q0', to: 'q2', symbol: '0' },
        { from: 'q0', to: 'q3', symbol: '1' },
        { from: 'q2', to: 'q2', symbol: '0' },
        { from: 'q2', to: 'q3', symbol: '1' },
        { from: 'q3', to: 'q2', symbol: '0' },
        { from: 'q3', to: 'q3', symbol: '1' },
        // q3 on '1' also goes to accepting q4
        { from: 'q3', to: 'q4', symbol: '1' },
        { from: 'q2', to: 'q4', symbol: '1' },
        { from: 'q0', to: 'q4', symbol: '1' },
      ],
    },
    testCases: [
      { input: '01', expected: true, explanation: 'Starts with "0" (branch A reaches q1). Also ends with "1" (branch B reaches q4).' },
      { input: '0', expected: true, explanation: 'Starts with "0". Branch A: q0→0→q1 (accepting).' },
      { input: '1', expected: true, explanation: 'Ends with "1". Branch B: q0→1→q4 (accepting).' },
      { input: '11', expected: true, explanation: 'Ends with "1". Accepted.' },
      { input: '001', expected: true, explanation: 'Starts with "0" and ends with "1".' },
      { input: '10', expected: false, explanation: 'Starts with "1" (branch A fails) and ends with "0" (branch B fails). Rejected.' },
      { input: '100', expected: false, explanation: 'Starts with "1", ends with "0". Rejected.' },
    ],
    hints: [
      { order: 1, text: 'NFAs explore ALL possible paths at once. A string is accepted if any path leads to an accepting state.' },
      { order: 2, text: 'Try a string ending in "1" — path 2 through q3→q5 will accept it.' },
      { order: 3, text: '"01" is a great choice — it starts with "0" and ends with "1".' },
    ],
    unlockAfter: 4,
    explanation: {
      conceptDescription:
        'An NFA can have multiple transitions for the same state-symbol pair. It accepts a string if at least one execution path reaches an accepting state.',
      automatonExplanation:
        'This NFA has two "branches": Branch A: q0→0→q1 — if the first symbol is "0", q1 accepts and loops forever. Branch B: tracks all transitions to capture "ends in 1" via state q4. Both run simultaneously from q0.',
      howToRead:
        'The highlighted active-states panel shows all states the NFA could be in at once. Multiple states can be highlighted simultaneously.',
      acceptedExample: {
        input: '01',
        why: 'Branch A: q0→0→q1 (accepting, starts with 0). Branch B: q0→0→q2→1→q4 (accepting, ends with 1). Both branches accept! ✓',
      },
      rejectedExample: {
        input: '10',
        why: 'Branch A: q0→1→(no path). Branch B: q0→1→q3→0→q2. Neither q3 nor q2 are accepting. ✗',
      },
      takeaway: 'NFAs are more expressive to describe than DFAs, even though they recognize the same class of languages.',
    },
  },

  // ──────────────────────────────────────────────
  // LEVEL 6 — The Epsilon Chamber
  // NFA with epsilon transitions
  // ──────────────────────────────────────────────
  {
    id: 6,
    title: 'The Epsilon Chamber',
    subtitle: 'The Silent Gateway',
    difficulty: 'Elite',
    concept: 'Epsilon (ε) transitions and epsilon-closure in NFAs',
    objective: 'Navigate an NFA that uses silent ε-transitions to connect states.',
    instructions:
      'This vault uses epsilon (ε) transitions — moves that happen without consuming any input symbol. The automaton accepts strings over {a,b,c} where the string is either all "a"s, all "b"s, or all "c"s.',
    automaton: {
      id: 'nfa-level6',
      type: 'NFA',
      description: 'Accepts a*, b*, or c* using epsilon transitions.',
      alphabet: ['a', 'b', 'c'],
      states: [
        { id: 'q0', label: 'q0', x: 15, y: 50 },
        { id: 'q1', label: 'q1', x: 45, y: 20 },
        { id: 'q2', label: 'q2', x: 45, y: 50 },
        { id: 'q3', label: 'q3', x: 45, y: 80 },
        { id: 'q4', label: 'q4', x: 75, y: 20 },
        { id: 'q5', label: 'q5', x: 75, y: 50 },
        { id: 'q6', label: 'q6', x: 75, y: 80 },
      ],
      initialState: 'q0',
      acceptingStates: ['q4', 'q5', 'q6'],
      transitions: [
        // Epsilon transitions from q0 to each branch
        { from: 'q0', to: 'q1', symbol: 'ε' },
        { from: 'q0', to: 'q2', symbol: 'ε' },
        { from: 'q0', to: 'q3', symbol: 'ε' },
        // Branch 1: a*
        { from: 'q1', to: 'q4', symbol: 'a' },
        { from: 'q4', to: 'q4', symbol: 'a' },
        // Branch 2: b*
        { from: 'q2', to: 'q5', symbol: 'b' },
        { from: 'q5', to: 'q5', symbol: 'b' },
        // Branch 3: c*
        { from: 'q3', to: 'q6', symbol: 'c' },
        { from: 'q6', to: 'q6', symbol: 'c' },
      ],
    },
    testCases: [
      { input: 'a', expected: true, explanation: 'Single "a" — accepted via branch 1.' },
      { input: 'aaa', expected: true, explanation: 'Three "a"s — accepted.' },
      { input: 'b', expected: true, explanation: 'Single "b" — accepted via branch 2.' },
      { input: 'bbb', expected: true, explanation: 'Three "b"s — accepted.' },
      { input: 'c', expected: true, explanation: 'Single "c" — accepted via branch 3.' },
      { input: 'cc', expected: true, explanation: 'Two "c"s — accepted.' },
      { input: 'ab', expected: false, explanation: 'Mixed — no branch accepts both "a" and "b".' },
      { input: 'abc', expected: false, explanation: 'Mixed symbols. Rejected.' },
      { input: 'ba', expected: false, explanation: 'Mixed. Rejected.' },
    ],
    hints: [
      { order: 1, text: 'ε-transitions happen for free — q0 immediately reaches q1, q2, and q3 all at once.' },
      { order: 2, text: 'Try entering just "a", "b", or "c". Each pure-symbol string is accepted.' },
      { order: 3, text: 'The epsilon-closure of q0 is {q0, q1, q2, q3}. All three branches are available from the start.' },
    ],
    unlockAfter: 5,
    explanation: {
      conceptDescription:
        'Epsilon (ε) transitions allow an NFA to move between states without consuming any input. They are extremely useful for composing automata.',
      automatonExplanation:
        'From q0, the machine silently jumps to all three branch states (q1, q2, q3) via ε-transitions. It then follows the branch that matches the input.',
      howToRead:
        'Arrows labeled "ε" are taken automatically, without reading any symbol. The epsilon-closure shows all states reachable without consuming input.',
      acceptedExample: {
        input: 'aaa',
        why: 'ε-closure(q0)={q0,q1,q2,q3}. →a→ moves q1→q4. →a→ q4→q4. →a→ q4. Final: {q4}. Accepting! ✓',
      },
      rejectedExample: {
        input: 'ab',
        why: 'After "a": active={q4}. After "b": no transition from q4 on "b". Active={}. No accepting state. ✗',
      },
      takeaway: 'Epsilon-closures extend the power of NFAs by allowing "free" state jumps before reading any symbol.',
    },
  },

  // ──────────────────────────────────────────────
  // LEVEL 7 — Reverse Engineering
  // DFA: accepts strings over {0,1} divisible by 3 (in binary)
  // ──────────────────────────────────────────────
  {
    id: 7,
    title: 'Reverse Engineering',
    subtitle: 'Decode the Unknown',
    difficulty: 'Master',
    concept: 'Analyze an unfamiliar automaton to determine the language it recognizes',
    objective:
      'Study the automaton and figure out what pattern it accepts without being told.',
    instructions:
      'You have intercepted an unknown automaton. Analyze its state diagram, test strings, and determine what language it recognizes. (Hint: the language has a mathematical property related to numbers.)',
    automaton: {
      id: 'dfa-level7',
      type: 'DFA',
      description: 'Accepts binary strings whose numeric value (base 2) is divisible by 3.',
      alphabet: ['0', '1'],
      states: [
        { id: 'r0', label: 'r0', x: 20, y: 50 },
        { id: 'r1', label: 'r1', x: 50, y: 25 },
        { id: 'r2', label: 'r2', x: 50, y: 75 },
      ],
      initialState: 'r0',
      acceptingStates: ['r0'],
      transitions: [
        // n = 2*n + 0: if remainder was k, new remainder is 2k mod 3
        { from: 'r0', to: 'r0', symbol: '0' }, // 2*0=0 mod3=0
        { from: 'r0', to: 'r1', symbol: '1' }, // 2*0+1=1 mod3=1
        { from: 'r1', to: 'r2', symbol: '0' }, // 2*1=2 mod3=2
        { from: 'r1', to: 'r0', symbol: '1' }, // 2*1+1=3 mod3=0
        { from: 'r2', to: 'r1', symbol: '0' }, // 2*2=4 mod3=1
        { from: 'r2', to: 'r2', symbol: '1' }, // 2*2+1=5 mod3=2
      ],
    },
    testCases: [
      { input: '0', expected: true, explanation: '0 in binary = 0. 0÷3=0 remainder 0. Accepted.' },
      { input: '11', expected: true, explanation: '"11" binary = 3. 3÷3=1 remainder 0. Accepted.' },
      { input: '110', expected: true, explanation: '"110" binary = 6. 6÷3=2 remainder 0. Accepted.' },
      { input: '1001', expected: true, explanation: '"1001" binary = 9. 9÷3=3 remainder 0. Accepted.' },
      { input: '1', expected: false, explanation: '"1" binary = 1. 1÷3=0 remainder 1. Rejected.' },
      { input: '10', expected: false, explanation: '"10" binary = 2. 2÷3=0 remainder 2. Rejected.' },
      { input: '100', expected: false, explanation: '"100" binary = 4. 4÷3=1 remainder 1. Rejected.' },
      { input: '101', expected: false, explanation: '"101" binary = 5. 5÷3=1 remainder 2. Rejected.' },
    ],
    hints: [
      { order: 1, text: 'Test "0", "11", "110" and see which are accepted. What do they have in common numerically?' },
      { order: 2, text: 'Interpret the binary strings as numbers. 0=0, 11=3, 110=6... all divisible by 3?' },
      { order: 3, text: 'The three states represent the remainder when the binary number is divided by 3: r0=0, r1=1, r2=2.' },
    ],
    unlockAfter: 6,
    explanation: {
      conceptDescription:
        'DFAs can compute mathematical functions on their input. This automaton reads a binary number digit by digit and tracks the remainder mod 3.',
      automatonExplanation:
        'Each state represents the current remainder (0, 1, or 2) when dividing the binary number seen so far by 3. Appending "0" doubles the number; appending "1" doubles and adds 1.',
      howToRead:
        'r0=remainder 0, r1=remainder 1, r2=remainder 2. r0 is both start and accepting state.',
      acceptedExample: {
        input: '110',
        why: 'r0→1→r1→1→r0→0→r0. Binary 110=6, 6 mod 3=0. Final state r0 is accepting. ✓',
      },
      rejectedExample: {
        input: '10',
        why: 'r0→1→r1→0→r2. Binary 10=2, 2 mod 3=2. Final state r2 is not accepting. ✗',
      },
      takeaway: 'DFAs can encode arithmetic operations — they are far more powerful than simple pattern matchers.',
    },
  },

  // ──────────────────────────────────────────────
  // LEVEL 8 — Final Vault
  // NFA with epsilon: accepts strings that are (ab)* or end in "aa"
  // ──────────────────────────────────────────────
  {
    id: 8,
    title: 'Final Vault',
    subtitle: 'The Ultimate Challenge',
    difficulty: 'Master',
    concept: 'Combined DFA/NFA challenge — strings that are (ab)* OR end in "aa"',
    objective:
      'Crack the most complex vault. It accepts strings that are repetitions of "ab" OR strings that end in "aa". Use everything you have learned.',
    instructions:
      'This is an NFA with epsilon transitions. It accepts strings over {a,b} that match (ab)* (empty, "ab", "abab", ...) OR strings that end with "aa". Analyze the automaton and find accepted strings.',
    automaton: {
      id: 'nfa-level8',
      type: 'NFA',
      description: 'Accepts strings matching (ab)* OR strings ending in "aa".',
      alphabet: ['a', 'b'],
      states: [
        { id: 's0', label: 's0', x: 10, y: 50 },
        // Branch 1: (ab)*
        { id: 's1', label: 's1', x: 35, y: 25 },
        { id: 's2', label: 's2', x: 55, y: 25 },
        { id: 's3', label: 's3', x: 75, y: 25 },
        // Branch 2: ends in "aa"
        { id: 's4', label: 's4', x: 35, y: 75 },
        { id: 's5', label: 's5', x: 55, y: 75 },
        { id: 's6', label: 's6', x: 75, y: 75 },
      ],
      initialState: 's0',
      acceptingStates: ['s3', 's6'],
      transitions: [
        // Epsilon to branch 1 and branch 2
        { from: 's0', to: 's1', symbol: 'ε' },
        { from: 's0', to: 's4', symbol: 'ε' },
        // Branch 1: (ab)*  s1=(ab)* start/accept, s2=saw 'a', s3=saw 'ab' (accept)
        { from: 's1', to: 's3', symbol: 'ε' }, // empty string accepted
        { from: 's1', to: 's2', symbol: 'a' },
        { from: 's2', to: 's3', symbol: 'b' },
        { from: 's3', to: 's2', symbol: 'a' }, // loop: after "ab", can start another "a"
        // Branch 2: ends in "aa"  s4=general, s5=saw one 'a', s6=saw "aa" (accept)
        { from: 's4', to: 's4', symbol: 'a' },
        { from: 's4', to: 's4', symbol: 'b' },
        { from: 's4', to: 's5', symbol: 'a' },
        { from: 's5', to: 's6', symbol: 'a' },
      ],
    },
    testCases: [
      { input: '', expected: true, explanation: '(ab)* includes empty string via ε path.' },
      { input: 'ab', expected: true, explanation: '"ab" matches (ab)^1.' },
      { input: 'abab', expected: true, explanation: '"abab" matches (ab)^2.' },
      { input: 'aa', expected: true, explanation: 'Ends in "aa".' },
      { input: 'baa', expected: true, explanation: 'Ends in "aa".' },
      { input: 'abaaa', expected: true, explanation: 'Ends in "aa".' },
      { input: 'a', expected: false, explanation: 'Not (ab)* and does not end in "aa".' },
      { input: 'ba', expected: false, explanation: 'Ends in "a" but not "aa".' },
      { input: 'abb', expected: false, explanation: 'Not (ab)* and does not end in "aa".' },
      { input: 'b', expected: false, explanation: 'Neither condition satisfied.' },
    ],
    hints: [
      { order: 1, text: 'Try the empty string "" — (ab)* includes zero repetitions.' },
      { order: 2, text: 'Try "ab" for the first branch, or "aa" for the second branch.' },
      { order: 3, text: 'ε-transitions let the NFA choose which branch to pursue simultaneously.' },
    ],
    unlockAfter: 7,
    explanation: {
      conceptDescription:
        'Complex regular languages can be built by combining simpler ones using union (OR). This NFA uses ε-transitions to split into two independent branches.',
      automatonExplanation:
        'Branch 1 recognizes (ab)* using a small loop. Branch 2 recognizes strings ending in "aa" with a linear scan. ε-transitions from s0 activate both branches simultaneously.',
      howToRead:
        'Both s3 and s6 are accepting states. Any path reaching either one constitutes acceptance.',
      acceptedExample: {
        input: 'abab',
        why: 'ε→s1→a→s2→b→s3→a→s2→b→s3. Matches (ab)^2. s3 is accepting. ✓',
      },
      rejectedExample: {
        input: 'abb',
        why: 'Branch 1: s1→a→s2→b→s3→b→no transition. Branch 2: ends in "b", not "aa". Both fail. ✗',
      },
      takeaway: 'ε-transitions enable NFA union — building complex languages from simpler building blocks.',
    },
  },
];

export default LEVELS;
