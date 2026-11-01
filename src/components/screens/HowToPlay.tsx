import { useState } from 'react';

type Screen = 'landing' | 'missions' | 'game' | 'jflap' | 'howtoplay' | 'results';
interface HowToPlayProps { onNavigate: (screen: Screen) => void; }

const SECTIONS = [
  {
    title: 'What is a Finite Automaton?',
    icon: '⚙',
    content: `A Finite Automaton (FA) is a mathematical machine that reads an input string one symbol at a time and decides whether to accept or reject it. It consists of:
    
• A finite set of states
• An input alphabet
• A transition function
• An initial (start) state
• A set of accepting (final) states

The machine starts in the initial state, processes each symbol according to its transition function, and accepts the input if and only if it ends in an accepting state.`,
  },
  {
    title: 'What do states represent?',
    icon: '●',
    content: `States represent the current "memory" or "stage" of the computation. Each state encodes exactly what the machine remembers about the input seen so far.

For example, in a vault that accepts binary strings ending in "01":
• State q0: no useful suffix seen yet
• State q1: last symbol was "0"
• State q2: last two symbols were "01" (accepting)

States are drawn as circles. The accepting state has a double circle. The initial state has an arrow pointing to it.`,
  },
  {
    title: 'How do transitions work?',
    icon: '→',
    content: `A transition defines: "when in state X and reading symbol a, move to state Y".

In the diagram, transitions are drawn as arrows labeled with the input symbol.

For a DFA (Deterministic FA): each state has exactly one arrow per input symbol — the next state is always determined.

For an NFA (Nondeterministic FA): a state can have zero, one, or multiple arrows for the same symbol. The machine explores all possibilities simultaneously.`,
  },
  {
    title: 'What are accepting states?',
    icon: '⊙',
    content: `Accepting states (also called final states) are marked with a double circle in the state diagram.

After reading the entire input string, if the machine is in an accepting state, the string is accepted (the vault is unlocked).

If the machine is in a non-accepting state after reading all input, the string is rejected.

For NFAs: the string is accepted if ANY possible execution path ends in an accepting state.`,
  },
  {
    title: 'DFA vs NFA',
    icon: '⟺',
    content: `DFA (Deterministic Finite Automaton):
• Exactly one transition per state per symbol
• Deterministic — only one possible execution
• Simple to simulate
• Every DFA is also an NFA

NFA (Nondeterministic Finite Automaton):
• Can have multiple transitions per state per symbol
• Can have epsilon (ε) transitions — free moves consuming no input
• Explores all paths simultaneously
• Accepts if ANY path leads to an accepting state
• NFAs and DFAs recognize the same class of languages (regular languages)`,
  },
  {
    title: 'Epsilon (ε) Transitions',
    icon: 'ε',
    content: `Epsilon transitions are special NFA transitions that do NOT consume any input symbol. They allow the machine to move between states "for free".

The epsilon-closure of a state S is the set of all states reachable from S using only epsilon transitions (including S itself).

Epsilon transitions make it easier to compose automata — for example, to represent the union of two languages, you add an initial state with epsilon transitions to both automata.`,
  },
  {
    title: 'How to enter strings',
    icon: '⌨',
    content: `In each vault:
1. Type your access code in the input field using symbols from the displayed alphabet
2. Click "Submit Access Code" or press Enter to run the full simulation
3. Or use "Simulate" to animate the execution step by step
4. Use "Step" to advance one symbol at a time
5. Click example strings in the right panel to load them automatically

For empty strings: leave the field blank or type nothing — some automata accept the empty string ε.`,
  },
  {
    title: 'Scoring system',
    icon: '★',
    content: `Points are awarded when you crack a vault:

• First attempt, no hints: 100 points (3 stars)
• First attempt with hints: 80 points (2-3 stars)  
• 2-3 attempts: 75 points
• More attempts: 60 points

Hints are free to use — they reduce your score slightly but won't lock you out.

Your best score per level is saved. Replaying a completed level only increases your total if you beat your best score.`,
  },
  {
    title: 'Using the JFLAP Lab',
    icon: '🔬',
    content: `The JFLAP Lab lets you:

1. Select any game automaton
2. Export it as a .jff file (JFLAP's native format)
3. Open it in the JFLAP application (available at jflap.org)
4. Test strings in JFLAP and compare results with the game
5. Import your own .jff files from JFLAP into the game

The .jff files are valid JFLAP XML — every state, transition, initial marker, and accepting marker is faithfully exported. The game's simulation results and JFLAP's results should always match.`,
  },
];

const GLOSSARY = [
  { term: 'Alphabet (Σ)', def: 'The finite set of symbols that can appear in input strings.' },
  { term: 'String', def: 'A finite sequence of symbols from the alphabet.' },
  { term: 'Language', def: 'A set of strings — the set of all strings an automaton accepts.' },
  { term: 'State', def: 'A configuration of the machine encoding what it remembers.' },
  { term: 'Initial State', def: 'The state the machine starts in before reading any input.' },
  { term: 'Accepting State', def: 'A state in which the machine accepts the input string.' },
  { term: 'Transition Function (δ)', def: 'Maps (state, symbol) → next state(s).' },
  { term: 'DFA', def: 'Deterministic Finite Automaton — exactly one transition per state per symbol.' },
  { term: 'NFA', def: 'Nondeterministic FA — multiple transitions allowed; accepts if any path accepts.' },
  { term: 'Epsilon (ε) Transition', def: 'A transition that moves to a new state without consuming any symbol.' },
  { term: 'Epsilon-Closure', def: 'All states reachable from a state via zero or more ε-transitions.' },
  { term: 'Accepted String', def: 'A string that causes the automaton to end in an accepting state.' },
  { term: 'Rejected String', def: 'A string that does not end in an accepting state.' },
];

export default function HowToPlay({ onNavigate }: HowToPlayProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('landing')}>← Back</button>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', fontSize: '1.5rem' }}>
            ❓ HOW TO PLAY
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
          {/* Nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {SECTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setActiveSection(i); setShowGlossary(false); }}
                style={{
                  background: activeSection === i && !showGlossary ? 'rgba(0,212,255,0.1)' : 'transparent',
                  border: `1px solid ${activeSection === i && !showGlossary ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'flex-start',
                  transition: 'all 0.15s',
                  color: activeSection === i && !showGlossary ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', width: '16px', flexShrink: 0, fontSize: '0.85rem' }}>{s.icon}</span>
                <span style={{ lineHeight: 1.3 }}>{s.title}</span>
              </button>
            ))}
            <button
              onClick={() => setShowGlossary(true)}
              style={{
                background: showGlossary ? 'rgba(170,68,255,0.1)' : 'transparent',
                border: `1px solid ${showGlossary ? 'rgba(170,68,255,0.3)' : 'transparent'}`,
                borderRadius: '4px',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'center',
                color: showGlossary ? 'var(--neon-purple)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                marginTop: '0.5rem',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', width: '16px', flexShrink: 0 }}>📚</span>
              Glossary
            </button>
          </div>

          {/* Content */}
          <div className="card" style={{ minHeight: '300px' }}>
            {showGlossary ? (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-purple)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  📚 Glossary of Terms
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {GLOSSARY.map((g, i) => (
                    <div key={i} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontSize: '0.82rem', marginBottom: '0.15rem' }}>
                        {g.term}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {g.def}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{SECTIONS[activeSection].icon}</span>
                  {SECTIONS[activeSection].title}
                </h2>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {SECTIONS[activeSection].content}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                    disabled={activeSection === 0}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                    disabled={activeSection === SECTIONS.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
