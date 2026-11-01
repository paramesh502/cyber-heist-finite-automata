# Cyber Heist: Crack the Vault Using Finite Automata

An educational puzzle game for Theory of Computation that teaches DFA, NFA, and JFLAP integration through an interactive cyberpunk heist storyline.

---

## Project Overview

Players take the role of a cybersecurity specialist breaking into digital vaults — each protected by a Finite Automaton. To unlock a vault, the player must understand the automaton's state transitions and submit an accepted input string. The game teaches DFA, NFA, epsilon transitions, formal language theory, and string acceptance through 8 progressively challenging missions.

**Evaluation categories:**
- JFLAP Implementation — 10 marks
- GUI Implementation — 10 marks

---

## Problem Statement

Traditional Theory of Computation courses present finite automata as abstract mathematical objects. This project makes DFA and NFA tangible by embedding them in interactive puzzles with animated state diagrams, real automata simulation, and genuine JFLAP file integration.

---

## Features

| Feature | Description |
|---|---|
| DFA Engine | Genuine delta(state,symbol)→nextState simulator with execution trace |
| NFA Engine | Subset-construction simulation tracking all reachable states simultaneously |
| Epsilon Closures | Correct ε-closure computation for NFA with epsilon transitions |
| 8 Game Levels | DFAs for pattern matching, parity, binary endings, mod-3 arithmetic; NFAs with epsilon |
| Animated State Diagrams | SVG-based interactive visualizations with highlighted active states |
| Step-by-step Simulation | Play / Pause / Step / Run Full / Adjust Speed controls |
| Execution Trace Table | Shows each step's from-state, to-state, symbol, and accepting status |
| JFLAP Export | Generates valid .jff XML files for all 8 automata |
| JFLAP Import | Parses .jff files from JFLAP into the game engine for testing |
| Scoring System | 100/80/75/60 points based on attempts and hints used |
| Progress Persistence | All progress saved to localStorage; survives browser refresh |
| Achievements | 8 achievements including NFA Master, Epsilon Lord, Vault Cracked |
| How to Play | Multi-section tutorial with glossary |
| 147 Automated Tests | DFA, NFA, epsilon, JFLAP, validation, and all level test cases |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 with TypeScript |
| Build Tool | Vite 8 |
| Styling | Custom CSS with CSS variables (cyberpunk theme) |
| Animations | Framer Motion (installed) + CSS animations |
| State Diagrams | SVG (hand-coded, no external graph library) |
| State Management | React Context + useReducer |
| Persistence | localStorage |
| Testing | Vitest + jsdom + Testing Library |

---

## Installation

```bash
git clone <repository-url>
cd FLA_endsem
npm install
```

---

## Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run all automated tests
npm test

# Run tests in watch mode
npm run test:watch

# Preview production build
npm run preview
```

The development server starts at **http://localhost:5173**

---

## Game Architecture

```
src/
├── engine/
│   ├── types.ts          # Automaton data models (State, Transition, Automaton, etc.)
│   ├── validate.ts       # Structural validation of automaton definitions
│   ├── dfa.ts            # DFA execution engine: runDFA(), dfaDelta()
│   ├── nfa.ts            # NFA engine: runNFA(), epsilonClosure(), nfaMove()
│   └── index.ts          # Re-exports
├── levels/
│   ├── types.ts          # Level type definitions
│   ├── definitions.ts    # All 8 level definitions with automata and test cases
│   └── index.ts
├── jflap/
│   ├── exporter.ts       # exportToJFLAP(): generates .jff XML
│   ├── importer.ts       # importFromJFLAP(): parses .jff XML
│   └── index.ts
├── store/
│   ├── gameStore.ts      # Scoring, achievements, localStorage persistence
│   └── GameContext.tsx   # React Context and reducer for global state
├── hooks/
│   └── useSimulation.ts  # Animation and step-by-step simulation logic
├── components/
│   ├── game/
│   │   ├── AutomataViz.tsx     # SVG state diagram component
│   │   ├── ExecutionTrace.tsx  # Trace table component
│   │   ├── SimControls.tsx     # Play/Pause/Step/Speed controls
│   │   └── HintPanel.tsx       # Progressive hint reveal
│   └── screens/
│       ├── LandingScreen.tsx   # Main menu
│       ├── MissionSelect.tsx   # Level selection grid
│       ├── GameScreen.tsx      # Main gameplay screen
│       ├── JFLAPLab.tsx        # JFLAP integration lab
│       └── HowToPlay.tsx       # Tutorial and glossary
└── tests/
    ├── dfa.test.ts       # 42 DFA tests
    ├── nfa.test.ts       # 98 NFA tests
    └── jflap.test.ts     # 7 JFLAP tests
```

---

## DFA Implementation

The DFA engine (`src/engine/dfa.ts`) implements the formal definition δ: Q × Σ → Q:

```typescript
runDFA(automaton, input) → DFAResult
```

1. Validate the automaton (unique states, valid initial/accepting states, no non-determinism)
2. Validate input symbols against the alphabet
3. Process each symbol: look up δ(currentState, symbol) in the transition map
4. If any transition is missing → reject with "dead state" explanation
5. After consuming all input → accept iff current state ∈ F

The execution trace records every step as `{ fromState, toState, symbol, isAccepting }` for the animation and table display.

---

## NFA Implementation

The NFA engine (`src/engine/nfa.ts`) uses **subset construction simulation**:

```typescript
runNFA(automaton, input) → NFAResult
```

1. Compute ε-closure of the initial state → initial active state set
2. For each input symbol:
   a. For every active state, find all transitions on that symbol → next states
   b. Compute ε-closure of all next states
   c. The new active set is the result
3. Accept if any state in the final active set is an accepting state

`epsilonClosure(automaton, stateSet)` computes reachability via ε-transitions using iterative DFS.

This correctly explores ALL possible paths simultaneously — never arbitrarily picks one.

---

## JFLAP Integration

### Export (.jff generation)

`exportToJFLAP(automaton)` generates standard JFLAP XML:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<structure>
  <type>fa</type>
  <automaton>
    <state id="0" name="q0" x="..." y="...">
      <initial/>
    </state>
    <state id="2" name="q2" x="..." y="...">
      <final/>
    </state>
    <transition>
      <from>0</from><to>1</to><read>0</read>
    </transition>
    <!-- Epsilon transitions use empty <read/> -->
  </automaton>
</structure>
```

### Import (.jff parsing)

`importFromJFLAP(xmlString)` parses a JFLAP file, extracts states/transitions, detects DFA vs NFA, and returns an `Automaton` compatible with the game engine.

### Verification Workflow

1. Select automaton in **JFLAP Lab** → click **Export .jff**
2. Open JFLAP (download from jflap.org) → File → Open → select .jff file
3. In JFLAP: Input → Multiple Run → enter strings from the test table
4. Compare JFLAP results with game results — they match for all 8 automata

**What runs in the game:** DFA/NFA simulation, visualization, export, import  
**What JFLAP adds:** Step-by-step visual runner, NFA→DFA conversion, minimization tools

---

## Level Descriptions

| # | Title | Automaton | Accepts |
|---|---|---|---|
| 1 | Reconnaissance | DFA, 3 states | Strings over {a,b} starting with "a" |
| 2 | Binary Access Code | DFA, 3 states | Binary strings ending in "01" |
| 3 | Parity Breach | DFA, 2 states | Binary strings with even number of 1s |
| 4 | Pattern Recognition | DFA, 4 states | Binary strings containing substring "101" |
| 5 | Nondeterministic Vault | NFA, 5 states | Strings starting with "0" OR ending in "1" |
| 6 | The Epsilon Chamber | NFA+ε, 7 states | Strings that are a\*, b\*, or c\* |
| 7 | Reverse Engineering | DFA, 3 states | Binary strings whose value is divisible by 3 |
| 8 | Final Vault | NFA+ε, 7 states | Strings matching (ab)\* OR ending in "aa" |

---

## Testing

```bash
npm test
# → 147 tests pass across 3 test files
```

Test coverage:
- All level automata validated structurally
- Every test case in every level verified against the engine
- DFA edge cases: empty string, invalid symbols, missing transitions
- NFA: epsilon closures, subset construction, single-character inputs
- JFLAP: XML generation, round-trip export→import, error handling

---

## JFLAP Demonstration (Evaluation Guide)

1. Start the app: `npm run dev` → open http://localhost:5173
2. Click **JFLAP LAB** from the main menu
3. Select **Level 2 (Binary Access Code)**
4. Click **Export .jff** — downloads `dfa-level2.jff`
5. Open JFLAP → File → Open → `dfa-level2.jff`
6. Verify: 3 states, q0 initial, q2 accepting, transitions match the diagram
7. In JFLAP: Input → Multiple Run → test "01", "101", "10", "111"
8. Compare with the game's test case table — all results identical
9. Repeat for **Level 6 (epsilon)** to demonstrate NFA+ε export

---

## Known Limitations

- JFLAP cannot be launched directly from the browser (different application)
- The game uses single-character alphabet symbols; multi-character labels (e.g., "ab") are not supported as a single symbol
- The NFA visualization shows state sets but does not draw all simultaneous active transition arrows (only the last consumed transition's origin states)
- The `dfaDelta` export function is available but the game internally uses the transition map directly

---

## Future Enhancements

- Pushdown Automata (PDA) levels
- Regular expression ↔ automata conversion
- NFA → DFA conversion visualizer (subset construction table)
- Minimization tool
- Custom automaton builder (drag-and-drop state editor)
- Leaderboard and multiplayer challenges
- Mobile responsive layout
