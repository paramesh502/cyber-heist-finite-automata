# JFLAP Files + Viva Cheatsheet
## Cyber Heist: Crack the Vault Using Finite Automata

---

## How to open in JFLAP
1. Download JFLAP from **jflap.org** (free, runs on Java)
2. Launch JFLAP → **File → Open** → select any `.jff` file
3. To test strings: **Input → Multiple Run** → paste strings → **Run All**
4. To step through: **Input → Step with Closure** → type string → step

---

## All 8 Automata — Quick Reference

### Level 1 — Reconnaissance (`Level1_Reconnaissance_DFA.jff`)
| Property | Value |
|---|---|
| Type | DFA |
| Alphabet | {a, b} |
| States | q0 (start), q1 (accept), q2 (dead) |
| Language | Strings starting with 'a' |
| Pattern | a(a+b)* |

**Test strings for JFLAP:**
| String | Result |
|---|---|
| a | ACCEPT |
| ab | ACCEPT |
| aba | ACCEPT |
| b | REJECT |
| ba | REJECT |
| (empty) | REJECT |

**Viva Q: Why is q2 called a dead/trap state?**
> Once you enter q2 (by reading 'b' first), no transition leads out of it to q1. It loops on both 'a' and 'b'. Any string starting with 'b' is permanently rejected.

---

### Level 2 — Binary Access Code (`Level2_BinaryAccessCode_DFA.jff`)
| Property | Value |
|---|---|
| Type | DFA |
| Alphabet | {0, 1} |
| States | q0, q1, q2 (accept) |
| Language | Binary strings ending in "01" |
| Pattern | (0+1)*01 |

**Transition table:**
```
       0     1
q0  →  q1    q0
q1  →  q1    q2*
q2* →  q1    q0
```

**Test strings:**
| String | Result |
|---|---|
| 01 | ACCEPT |
| 101 | ACCEPT |
| 1101 | ACCEPT |
| 10 | REJECT |
| 111 | REJECT |
| 010 | REJECT |

**Viva Q: How does the DFA "remember" only the last two characters?**
> q0 encodes "last char was 1 (or nothing)". q1 encodes "last char was 0". q2 encodes "last two chars were 01". The state itself is the memory — no explicit storage needed.

**Viva Q: Trace "101" step by step.**
> q0 →1→ q0 →0→ q1 →1→ q2. Final state q2 is accepting. ✓

---

### Level 3 — Parity Breach (`Level3_ParityBreach_DFA.jff`)
| Property | Value |
|---|---|
| Type | DFA |
| Alphabet | {0, 1} |
| States | even (start+accept), odd |
| Language | Binary strings with even count of 1s |

**Viva Q: Why does this need only 2 states?**
> Parity (even/odd) has exactly 2 values. The DFA only needs to remember which parity it's currently in. Reading '0' doesn't change parity; reading '1' flips it.

**Viva Q: Is the empty string accepted?**
> Yes. The empty string has zero 1s. Zero is even. The machine starts and ends in the "even" state, which is accepting.

**Test strings:**
| String | Count of 1s | Result |
|---|---|---|
| (empty) | 0 (even) | ACCEPT |
| 11 | 2 (even) | ACCEPT |
| 1010 | 2 (even) | ACCEPT |
| 1 | 1 (odd) | REJECT |
| 111 | 3 (odd) | REJECT |

---

### Level 4 — Pattern Recognition (`Level4_PatternRecognition_DFA.jff`)
| Property | Value |
|---|---|
| Type | DFA |
| Alphabet | {0, 1} |
| States | q0, q1, q2, q3 (accept) |
| Language | Binary strings containing substring "101" |
| Pattern | (0+1)*101(0+1)* |

**States mean:**
- q0 = no progress (or reset)
- q1 = matched "1"
- q2 = matched "10"
- q3 = matched "101" ← accepting, never leaves

**Viva Q: Why does δ(q2, 0) go back to q0 (not q1)?**
> After seeing "10", if we read "0", we have "100". This contains no progress: the last character is '0' (not '1'), so we cannot continue building "101". We go back to q0. (Unlike q1 which tracks a single leading '1'.)

**Test strings:**
| String | Result |
|---|---|
| 101 | ACCEPT |
| 0101 | ACCEPT |
| 1001 | REJECT |
| 000 | REJECT |

---

### Level 5 — Nondeterministic Vault (`Level5_NondeterministicVault_NFA.jff`)
| Property | Value |
|---|---|
| Type | NFA |
| Alphabet | {0, 1} |
| States | q0 (start), q1 (accept), q2, q3, q4 (accept) |
| Language | Strings starting with '0' OR ending in '1' |
| Pattern | 0(0+1)* ∪ (0+1)*1 |

**Viva Q: What makes this an NFA?**
> From q0 on input '1', there are TWO transitions: to q3 AND to q4. In a DFA, each state must have exactly one transition per symbol. Here we have multiple, making it nondeterministic.

**Viva Q: How does JFLAP handle multiple paths?**
> JFLAP explores all paths simultaneously (subset construction simulation). It accepts if ANY path ends in an accepting state.

**Viva Q: Why is "10" rejected?**
> Branch A (starts with 0): first symbol is '1', not '0' — fails immediately. Branch B (ends in 1): last symbol is '0', not '1' — fails. Both branches fail → REJECT.

**Test strings:**
| String | Result | Reason |
|---|---|---|
| 0 | ACCEPT | Starts with 0 (branch A) |
| 1 | ACCEPT | Ends with 1 (branch B) |
| 01 | ACCEPT | Both conditions |
| 10 | REJECT | Neither |
| 100 | REJECT | Neither |

---

### Level 6 — Epsilon Chamber (`Level6_EpsilonChamber_NFA.jff`)
| Property | Value |
|---|---|
| Type | NFA with ε-transitions |
| Alphabet | {a, b, c} |
| States | q0 (start), q1-q3 (branch starts), q4-q6 (accept) |
| Language | a* ∪ b* ∪ c* |

**Viva Q: What is an epsilon (ε) transition?**
> An ε-transition is a move that happens without consuming any input symbol. The automaton can "teleport" to another state for free.

**Viva Q: What is the epsilon-closure of q0?**
> ε-closure(q0) = {q0, q1, q2, q3} — all three branch-start states are reachable from q0 without reading any input.

**Viva Q: Why is "ab" rejected?**
> After reading 'a': only q4 is active (via q1). After reading 'b': no transition from q4 on 'b'. Active set becomes empty. No accepting state reachable → REJECT.

**In JFLAP:** Epsilon transitions are shown as arrows labeled **λ** (lambda). You will see three λ-arrows from q0.

**Test strings:**
| String | Result |
|---|---|
| a | ACCEPT |
| aaa | ACCEPT |
| b | ACCEPT |
| cc | ACCEPT |
| ab | REJECT |
| abc | REJECT |

---

### Level 7 — Reverse Engineering (`Level7_ReverseEngineering_DFA.jff`)
| Property | Value |
|---|---|
| Type | DFA |
| Alphabet | {0, 1} |
| States | r0 (start+accept), r1, r2 |
| Language | Binary strings whose numeric value is divisible by 3 |

**States represent remainders:**
- r0 = current value mod 3 = **0** ← accepting
- r1 = current value mod 3 = **1**
- r2 = current value mod 3 = **2**

**Transition logic:** Reading bit b appends to the binary number: new value = 2×old + b
```
δ(r0, 0) = r0   [2×0+0=0, 0 mod 3=0]
δ(r0, 1) = r1   [2×0+1=1, 1 mod 3=1]
δ(r1, 0) = r2   [2×1+0=2, 2 mod 3=2]
δ(r1, 1) = r0   [2×1+1=3, 3 mod 3=0]
δ(r2, 0) = r1   [2×2+0=4, 4 mod 3=1]
δ(r2, 1) = r2   [2×2+1=5, 5 mod 3=2]
```

**Viva Q: Trace "110" (=6) step by step.**
> r0 →1→ r1 →1→ r0 →0→ r0. Final: r0 (accepting). 6 mod 3 = 0. ✓

**Viva Q: Why does this need exactly 3 states?**
> Division by 3 has exactly 3 possible remainders: 0, 1, 2. Each state encodes one remainder. The DFA is minimal — you cannot do it with fewer states.

**Test strings:**
| String | Binary value | Result |
|---|---|---|
| 0 | 0 | ACCEPT |
| 11 | 3 | ACCEPT |
| 110 | 6 | ACCEPT |
| 1001 | 9 | ACCEPT |
| 1 | 1 | REJECT |
| 10 | 2 | REJECT |

---

### Level 8 — Final Vault (`Level8_FinalVault_NFA.jff`)
| Property | Value |
|---|---|
| Type | NFA with ε-transitions |
| Alphabet | {a, b} |
| States | s0 (start), s1-s3 (branch 1), s4-s6 (branch 2) |
| Language | (ab)* ∪ (a+b)*aa |
| Accepting | s3 (ab)* branch), s6 (aa-ending branch) |

**Branch 1:** (ab)*
- s0 →ε→ s1 →ε→ s3 (empty string accepted)
- s1 →a→ s2 →b→ s3 →a→ s2 ... (repeating ab)

**Branch 2:** ends in "aa"
- s0 →ε→ s4 (loops on a and b, then s4→a→s5→a→s6)

**Viva Q: Why is the empty string accepted?**
> s0 →ε→ s1 →ε→ s3. s3 is accepting. The ε-path reaches an accepting state without consuming any input. (ab)^0 = empty string ∈ (ab)*.

**Viva Q: Explain the union construction using ε-transitions.**
> Two separate automata (one for (ab)*, one for (a+b)*aa) are connected to a new start state s0 via ε-transitions. s0 can non-deterministically "choose" which language to check. This is the standard NFA union construction.

**Test strings:**
| String | Result | Reason |
|---|---|---|
| (empty) | ACCEPT | (ab)^0 |
| ab | ACCEPT | (ab)^1 |
| abab | ACCEPT | (ab)^2 |
| aa | ACCEPT | ends in "aa" |
| baa | ACCEPT | ends in "aa" |
| a | REJECT | neither condition |
| ba | REJECT | ends in "a" not "aa" |
| abb | REJECT | not (ab)*, doesn't end in "aa" |

---

## Common Viva Questions

**Q: What is the difference between DFA and NFA?**
> DFA: exactly one transition per (state, symbol) pair. NFA: zero, one, or multiple transitions per pair; also allows ε-transitions. Both recognize exactly the class of regular languages (they are equivalent in power).

**Q: If NFA and DFA are equivalent, why use NFAs?**
> NFAs are easier to design and can be exponentially more compact than the equivalent DFA. The subset construction converts any NFA to a DFA, but the DFA may have 2^n states for an n-state NFA.

**Q: What is a regular language?**
> A language recognizable by a finite automaton (DFA or NFA). Equivalently, a language describable by a regular expression.

**Q: How do you verify your JFLAP files match the game?**
> Open the .jff in JFLAP → Input → Multiple Run → enter the test strings from the game's test case table → confirm all Accept/Reject results match exactly.

**Q: What does the JFLAP Lab in the game do?**
> It exports each automaton as a .jff file, shows the XML, provides a test string verifier using the game's own engine, and supports importing .jff files from JFLAP back into the game.
