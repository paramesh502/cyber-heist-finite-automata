import type { Automaton, AutomatonState, Transition } from '../engine/types';

/**
 * Generates a valid JFLAP .jff XML file from an automaton definition.
 *
 * JFLAP file format (version 5.0):
 * <structure>
 *   <type>fa</type>
 *   <automaton>
 *     <state id="0" name="q0" x="50.0" y="50.0"><initial/><final/></state>
 *     ...
 *     <transition><from>0</from><to>1</to><read>a</read></transition>
 *     ...
 *   </automaton>
 * </structure>
 */
export function exportToJFLAP(automaton: Automaton): string {
  const stateIndexMap = new Map<string, number>();
  automaton.states.forEach((s, i) => stateIndexMap.set(s.id, i));

  const statesXML = automaton.states
    .map((state: AutomatonState) => {
      const idx = stateIndexMap.get(state.id)!;
      // Scale positions: our 0-100 percentage → JFLAP pixel coords (multiply by 4)
      const x = (state.x * 6).toFixed(1);
      const y = (state.y * 4).toFixed(1);
      const isInitial = state.id === automaton.initialState;
      const isAccepting = automaton.acceptingStates.includes(state.id);

      let stateXML = `    <state id="${idx}" name="${escapeXML(state.label)}" x="${x}" y="${y}">`;
      if (isInitial) stateXML += '\n      <initial/>';
      if (isAccepting) stateXML += '\n      <final/>';
      stateXML += '\n    </state>';
      return stateXML;
    })
    .join('\n');

  const transitionsXML = automaton.transitions
    .map((t: Transition) => {
      const fromIdx = stateIndexMap.get(t.from)!;
      const toIdx = stateIndexMap.get(t.to)!;
      // In JFLAP, epsilon transitions use an empty <read/> or <read></read>
      const readTag =
        t.symbol === 'ε'
          ? '      <read/>'
          : `      <read>${escapeXML(t.symbol)}</read>`;
      return `    <transition>\n      <from>${fromIdx}</from>\n      <to>${toIdx}</to>\n${readTag}\n    </transition>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!--
  JFLAP Automaton Export — Cyber Heist: Crack the Vault
  Automaton: ${escapeXML(automaton.id)}
  Type: ${automaton.type}
  Description: ${escapeXML(automaton.description)}
  
  To open: Launch JFLAP → File → Open → select this .jff file
  To test: Input → Multiple Run → enter test strings
-->
<structure>
  <type>fa</type>
  <automaton>
${statesXML}
${transitionsXML}
  </automaton>
</structure>`;
}

/**
 * Escape special XML characters.
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Trigger a browser download of the .jff file.
 */
export function downloadJFLAP(automaton: Automaton): void {
  const xml = exportToJFLAP(automaton);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${automaton.id}.jff`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
