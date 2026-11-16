# Cyber Heist: Crack the Vault Using Finite Automata

> An educational puzzle game for Theory of Computation — teaches DFA, NFA, and epsilon transitions through an interactive cyberpunk heist storyline.

**Live (local network):** `http://<your-machine-ip>:5173`  
**GitHub:** https://github.com/paramesh502/cyber-heist-finite-automata

---

## Project Overview

Players are cybersecurity specialists breaking into digital vaults — each protected by a Finite Automaton. To unlock a vault, the player must understand the automaton's state transitions and submit an accepted input string.

The game covers DFA, NFA, epsilon transitions, formal language theory, and string acceptance through 8 progressively challenging missions, plus a bonus DFA-builder mini-game called **Wire Cutter**.

**Evaluation:** JFLAP Implementation (10 marks) + GUI Implementation (10 marks)

---

## Features

| Feature | Description |
|---|---|
| DFA Engine | `delta(state, symbol) → nextState` simulator with full execution trace |
| NFA Engine | Subset-construction simulation tracking all reachable states simultaneously |
| Epsilon Closures | Correct ε-closure computation for NFAs with epsilon transitions |
| 8 Game Levels | DFAs and NFAs covering patterns, parity, binary endings, mod-3 arithmetic, epsilon |
| Wire Cutter Mini-Game | Build your own DFA from scratch — drag, drop, draw transitions, verify against test cases |
| Animated State Diagrams | SVG-based interactive visualizations with highlighted active states |
| Step-by-step Simulation | Play / Pause / Step / Run Full / Adjust Speed controls |
| Execution Trace Table | Every step's from-state, to-state, symbol, and accepting status |
| JFLAP Export | Generates valid `.jff` XML files for all 8 automata |
| JFLAP Import | Parses `.jff` files from JFLAP back into the game engine |
| Scoring System | 100 / 80 / 75 / 60 points based on attempts and hints used |
| Progress Persistence | All progress saved to `localStorage` — survives browser refresh |
| Achievements | 8 achievements including NFA Master, Epsilon Lord, Vault Cracked |
| How to Play | 9-section tutorial with full glossary |
| Local Network Access | Run on Wi-Fi — any device on the network can play |
| 147 Automated Tests | DFA, NFA, epsilon, JFLAP, validation, and all level test cases |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 with TypeScript |
| Build Tool | Vite 8 |
| Styling | Custom CSS with CSS variables (cyberpunk dark theme) |
| Animations | CSS keyframe animations |
| State Diagrams | SVG (hand-coded, no external graph library) |
| State Management | React Context + useReducer |
| Persistence | localStorage |
| Testing | Vitest + jsdom + Testing Library |

---

## Installation

```bash
git clone https://github.com/paramesh502/cyber-heist-finite-automata.git
cd cyber-heist-finite-automata
npm install
```

---

## Commands

```bash
# Start development server (accessible on local network)
npm run dev

# Build for production
npm run build

# Run all automated tests
npm test

# Preview production build
npm run preview
```

The dev server starts at **http://localhost:5173**  
On local network (same Wi-Fi): **http://\<your-ip\>:5173**

To find your IP:
- **Mac:** `ipconfig getifaddr en0`
- **Windows:** `ipconfig` → IPv4 Address
- **Linux:** `hostname -I`

---

## Running on Local Network

`vite.config.ts` has `host: true` set — this exposes the server on all network interfaces automatically. Just start `npm run dev` and share the Network URL printed in the terminal with anyone on the same Wi-Fi.

---

## Project Structure

```
src/
├── engine/
│   ├── types.ts          # Automaton data models
│   ├── validate.ts       # Structural validation
│   ├── dfa.ts            # DFA execution engine
│   ├── nfa.ts            # NFA engine + epsilonClosure + nfaMove
│   └── index.ts
├── levels/
│   ├── types.ts          # Level type definitions
│   ├── definitions.ts    # All 8 level definitions
│   └── index.ts
├── jflap/
│   ├── exporter.ts       # exportToJFLAP() — generates .jff XML
│   ├── importer.ts       # importFromJFLAP() — parses .jff XML
│   └── index.ts
├── store/
│   ├── gameStore.ts      # Scoring, achievements, localStorage
│   └── GameContext.tsx   # React Context + reducer
├── hooks/
│   └── useSimulation.ts  # Animated step-by-step simulation
├── components/
│   ├── game/
│   │   ├── AutomataViz.tsx       # SVG state diagram
│   │   ├── ExecutionTrace.tsx    # Trace table
│   │   ├── SimControls.tsx       # Play/Pause/Step/Speed
│   │   ├── HintPanel.tsx         # Progressive hints
│   │   ├── DFABuilder.tsx        # Wire Cutter drag-drop canvas
│   │   └── WireCutterEngine.ts   # Wire Cutter puzzles + checker
│   └── screens/
│       ├── LandingScreen.tsx
│       ├── MissionSelect.tsx
│       ├── GameScreen.tsx
│       ├── JFLAPLab.tsx
│       ├── HowToPlay.tsx
│       └── WireCutter.tsx        # Wire Cutter mini-game screen
└── tests/
    ├── dfa.test.ts       # 42 DFA tests
    ├── nfa.test.ts       # 98 NFA tests
    └── jflap.test.ts     # 7 JFLAP tests
```

---

## Game Levels

| # | Title | Type | Language |
|---|---|---|---|
| 1 | Reconnaissance | DFA | Strings starting with 'a' |
| 2 | Binary Access Code | DFA | Binary strings ending in "01" |
| 3 | Parity Breach | DFA | Even number of 1s |
| 4 | Pattern Recognition | DFA | Contains substring "101" |
| 5 | Nondeterministic Vault | NFA | Starts with '0' OR ends in '1' |
| 6 | Epsilon Chamber | NFA + ε | a\* ∪ b\* ∪ c\* |
| 7 | Reverse Engineering | DFA | Binary value divisible by 3 |
| 8 | Final Vault | NFA + ε | (ab)\* ∪ ends in "aa" |

---

## Wire Cutter Mini-Game

Build your own DFA from scratch to match a target language description.

| # | Puzzle | Language | Min States |
|---|---|---|---|
| 1 | First Signal | Contains at least one 'a' | 2 |
| 2 | Binary Tail | Ends in '0' | 2 |
| 3 | Triple Threat | Length divisible by 3 | 3 |
| 4 | No Double Zero | No "00" substring | 3 |
| 5 | Exact Length | Exactly length 2 | 4 |

Controls: place states → draw transitions by dragging → double-click to toggle accepting → right-click to set initial → click **Check My DFA** to verify against real test cases using the game's own DFA engine.

---

## DFA Implementation

```
runDFA(automaton, input) → DFAResult
```

1. Validate the automaton structurally
2. Check all input symbols are in the alphabet
3. For each symbol: look up `δ(currentState, symbol)` in the transition map
4. Missing transition → reject with "dead state" explanation
5. After all input → accept iff final state ∈ accepting states

---

## NFA Implementation

```
runNFA(automaton, input) → NFAResult
```

1. Compute `ε-closure(initialState)` → initial active set
2. For each symbol: `nfaMove(activeSet, symbol)` → `ε-closure(result)`
3. Accept if any state in the final active set is accepting

`epsilonClosure()` uses iterative DFS over ε-transitions.  
All reachable states are tracked simultaneously — never an arbitrary single path.

---

## JFLAP Integration

### Export

```
JFLAP Lab → Select automaton → Export .jff
```

Generates valid JFLAP XML with `<state>`, `<initial/>`, `<final/>`, and `<transition>` elements. Epsilon transitions use `<read/>` (empty read tag).

### Verification workflow

1. Click **JFLAP Lab** → select a level → **Export .jff**
2. Open JFLAP (jflap.org) → **File → Open** → select the file
3. **Input → Multiple Run** → paste test strings → **Run All**
4. Results match the game's test case table exactly

### Import

Upload any `.jff` file from JFLAP back into the game — the importer parses states, transitions, initial/accepting markers, and detects DFA vs NFA automatically.

**What runs in-game:** simulation, visualization, export, import  
**What JFLAP adds:** visual step-by-step runner, NFA→DFA conversion, minimization

---

## JFLAP Files

All 8 automata are pre-exported in `jflap_files/`:

```
jflap_files/
├── Level1_Reconnaissance_DFA.jff
├── Level2_BinaryAccessCode_DFA.jff
├── Level3_ParityBreach_DFA.jff
├── Level4_PatternRecognition_DFA.jff
├── Level5_NondeterministicVault_NFA.jff
├── Level6_EpsilonChamber_NFA.jff
├── Level7_ReverseEngineering_DFA.jff
├── Level8_FinalVault_NFA.jff
└── VIVA_CHEATSHEET.md        ← step-by-step traces + viva Q&A
```

---

## Testing

```bash
npm test
# → 147 tests pass across 3 test files
```

| File | Tests | Covers |
|---|---|---|
| `dfa.test.ts` | 42 | All DFA levels, edge cases, trace correctness, validation |
| `nfa.test.ts` | 98 | All NFA levels, epsilon closure, move, all test cases |
| `jflap.test.ts` | 7 | XML generation, round-trip export→import, error handling |

---

## JFLAP Demonstration Guide (Evaluation)

1. `npm run dev` → open http://localhost:5173
2. Click **JFLAP Lab** → select **Level 2 (Binary Access Code)** → **Export .jff**
3. Open JFLAP → **File → Open** → `dfa-level2.jff`
4. Verify: 3 states, q0 initial, q2 accepting, all transitions correct
5. **Input → Multiple Run** → test `01`, `101`, `10`, `111` → results match game
6. Repeat for **Level 6** to demonstrate NFA + ε export

---

## Known Limitations

- JFLAP cannot be embedded directly in the browser — the workflow is file-based (export → open in JFLAP)
- Multi-character alphabet symbols are not supported (each symbol must be a single character)
- NFA visualization shows active state sets but does not animate all simultaneous transition arrows

---

## Future Enhancements

- Pushdown Automata (PDA) levels
- Regular expression ↔ automaton conversion visualizer
- NFA → DFA subset construction table
- Cipher Race mini-game (timed string testing)
- Multiplayer heist mode
- Mobile layout
