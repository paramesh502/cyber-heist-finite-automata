import React, { useState, useRef } from 'react';
import { LEVELS } from '../../levels';
import { downloadJFLAP, exportToJFLAP, importFromJFLAP } from '../../jflap';
import { runDFA } from '../../engine/dfa';
import { runNFA } from '../../engine/nfa';
import AutomataViz from '../game/AutomataViz';
import type { Automaton } from '../../engine/types';

type Screen = 'landing' | 'missions' | 'game' | 'jflap' | 'howtoplay' | 'results';

interface JFLAPLabProps {
  onNavigate: (screen: Screen) => void;
}

export default function JFLAPLab({ onNavigate }: JFLAPLabProps) {
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [importedAutomaton, setImportedAutomaton] = useState<Automaton | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ accepted: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLevel = LEVELS.find((l) => l.id === selectedLevelId)!;
  const displayAutomaton = importedAutomaton ?? selectedLevel.automaton;

  const handleDownload = () => {
    downloadJFLAP(selectedLevel.automaton);
    setDownloadedId(selectedLevel.automaton.id);
    setTimeout(() => setDownloadedId(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const result = importFromJFLAP(content);
      if (result.success && result.automaton) {
        setImportedAutomaton(result.automaton);
        setImportError(null);
      } else {
        setImportError(result.errors.join('; '));
        setImportedAutomaton(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTest = () => {
    if (!testInput.trim() && testInput !== '') return;
    const automaton = displayAutomaton;
    let result;
    if (automaton.type === 'DFA') {
      result = runDFA(automaton, testInput);
    } else {
      result = runNFA(automaton, testInput);
    }
    if (result.errorMessage) {
      setTestResult({ accepted: false, message: result.errorMessage });
    } else {
      setTestResult({
        accepted: result.accepted,
        message: result.accepted
          ? `✓ ACCEPTED — the string "${testInput}" is in the language.`
          : `✗ REJECTED — ${result.rejectionReason ?? 'not in language'}`,
      });
    }
  };

  const jffContent = exportToJFLAP(selectedLevel.automaton);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('landing')}>← Back</button>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon-cyan)', fontSize: '1.5rem' }}>
            🔬 JFLAP LAB
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Export automata as JFLAP-compatible .jff files, verify strings, and import .jff files back into the game.
          The automata shown here are identical to those used in the game levels.
        </p>

        {/* Info box */}
        <div style={{
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          <strong style={{ color: 'var(--neon-cyan)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>
            JFLAP INTEGRATION WORKFLOW
          </strong>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Select an automaton from the list below and click <em>Export .jff</em>.</li>
            <li>Open JFLAP (jflap.org) → File → Open → select the downloaded .jff file.</li>
            <li>In JFLAP: Input → Multiple Run → enter test strings from the table.</li>
            <li>Compare JFLAP's results with the game's results — they should match exactly.</li>
            <li>You can also import a .jff file you created in JFLAP into this lab for testing.</li>
          </ol>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <strong>What the game does:</strong> Runs DFA/NFA simulation, visualizes state diagrams, exports/imports .jff XML.<br />
            <strong>What JFLAP adds:</strong> Visual step-by-step run, formal verification, NFA→DFA conversion, minimization.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Left: Level selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              SELECT AUTOMATON
            </div>
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => { setSelectedLevelId(l.id); setImportedAutomaton(null); setTestResult(null); }}
                style={{
                  background: selectedLevelId === l.id ? 'rgba(0,212,255,0.1)' : 'var(--bg-card)',
                  border: `1px solid ${selectedLevelId === l.id ? 'rgba(0,212,255,0.4)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  padding: '0.6rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: selectedLevelId === l.id ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
                  {String(l.id).padStart(2, '0')} {l.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {l.automaton.type} &nbsp;·&nbsp; {l.automaton.states.length} states
                </div>
              </button>
            ))}

            {/* Import button */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                IMPORT .JFF
              </div>
              <input
                type="file"
                accept=".jff"
                ref={fileInputRef}
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%' }}
              >
                📂 Import JFLAP File
              </button>
              {importError && (
                <p style={{ fontSize: '0.7rem', color: 'var(--neon-red)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
                  ⚠ {importError}
                </p>
              )}
              {importedAutomaton && (
                <p style={{ fontSize: '0.7rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
                  ✓ Loaded: {importedAutomaton.type} with {importedAutomaton.states.length} states
                </p>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                AUTOMATON: {displayAutomaton.id}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {displayAutomaton.description}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Type: </span><span style={{ color: 'var(--neon-blue)' }}>{displayAutomaton.type}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>States: </span>{displayAutomaton.states.length}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Alphabet: </span>{'{'}{displayAutomaton.alphabet.join(', ')}{'}'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Transitions: </span>{displayAutomaton.transitions.length}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Initial: </span><span style={{ color: 'var(--neon-cyan)' }}>{displayAutomaton.initialState}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Accepting: </span><span style={{ color: 'var(--neon-green)' }}>{displayAutomaton.acceptingStates.join(', ')}</span></div>
              </div>

              <AutomataViz automaton={displayAutomaton} activeStates={[]} width={450} height={200} />

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={handleDownload}>
                  {downloadedId === selectedLevel.automaton.id ? '✓ Downloaded!' : '⬇ Export .jff'}
                </button>
              </div>
            </div>

            {/* Test strings */}
            <div className="card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                VERIFY STRINGS (compare with JFLAP results)
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter test string..."
                  onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleTest}>
                  Test
                </button>
              </div>

              {testResult && (
                <div style={{
                  padding: '0.6rem',
                  borderRadius: '4px',
                  background: testResult.accepted ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)',
                  border: `1px solid ${testResult.accepted ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`,
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  color: testResult.accepted ? 'var(--neon-green)' : 'var(--neon-red)',
                  marginBottom: '0.75rem',
                }} className="anim-fade-in">
                  {testResult.message}
                </div>
              )}

              {/* Test case table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.3rem 0.5rem', textAlign: 'left' }}>Input String</th>
                      <th style={{ padding: '0.3rem 0.5rem', textAlign: 'left' }}>Expected (Game)</th>
                      <th style={{ padding: '0.3rem 0.5rem', textAlign: 'left' }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLevel.testCases.map((tc, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
                        <td style={{ padding: '0.3rem 0.5rem', color: 'var(--neon-cyan)' }}>
                          "{tc.input === '' ? 'ε (empty)' : tc.input}"
                        </td>
                        <td style={{ padding: '0.3rem 0.5rem', color: tc.expected ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                          {tc.expected ? '✓ ACCEPT' : '✗ REJECT'}
                        </td>
                        <td style={{ padding: '0.3rem 0.5rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                          {tc.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* XML preview */}
            <div className="card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                .JFF XML PREVIEW
              </div>
              <pre style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '0.75rem',
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
                maxHeight: '200px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.5,
              }}>
                {jffContent}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
