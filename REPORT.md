# bug-hunt-utils — Bug Report

Bounty: `bug-hunt-utils` (AIProve, ends 2026-11-15 20:49 WIB, prize 0.5 NVDA).
Challenge source: `AIProveRH/aiprove`, `challenges/bug-hunt-utils/utils.js`
(cloned 2026-11-14 ~17:57 WIB; verbatim copy in this directory as `utils.js`).
Entry format per challenge README: a JSON list `[{fn, input, expected}]`.

Submission files in this directory:
- `report.json` — the entry: 4 reports (2 certain + 2 borderline, see below).
- `report-conservative.json` — only the 2 certain bugs, if the parent prefers
  the safe play.
- `reproduce.js` — replays every report in `report.json` against the challenge
  `utils.js`; run `node reproduce.js` (exit 0 = all 4 reproduce a mismatch).
- `utils.js` — verbatim copy of the challenge file (for the repro script).
- `CHALLENGE-README.md` — verbatim copy of the challenge README.

## Bug 1 — factorial (CERTAIN)

- Function: `factorial(n)` — `let r=1; for(let i=2;i<n;i++) r*=i; return r;`
- Failing input: `5`
- Actual output: `24`
- Correct output: `120`
- Explanation: the loop condition is `i < n`, so the final factor `n` is never
  multiplied in. `factorial(5)` computes 2·3·4 = 24 instead of 2·3·4·5 = 120.
  Also `factorial(2)` returns 1 instead of 2, and `factorial(10)` returns
  362880 instead of 3628800. (`factorial(0)` and `factorial(1)` are still
  correct at 1.) The challenge file itself comments this line
  ("bug: i<n drops n").
- Report: `{"fn":"factorial","input":5,"expected":120}`

## Bug 2 — countVowels (CERTAIN)

- Function: `countVowels(s)` — `(s.match(/[aeiou]/g)||[]).length`
- Failing input: `"AEIOU"`
- Actual output: `0`
- Correct output: `5`
- Explanation: the regex only matches lowercase vowels, so every uppercase
  vowel is missed. `countVowels("AEIOU")` returns 0; `countVowels("aEiOu")`
  returns 3 instead of 5. The challenge file itself comments this line
  ("bug: misses uppercase vowels").
- Report: `{"fn":"countVowels","input":"AEIOU","expected":5}`

## Bug 3 — reverse (BORDERLINE: depends on the hidden reference)

- Function: `reverse(s)` — `s.split("").reverse().join("")`
- Failing input: `"😀a"` (U+1F600 GRINNING FACE + "a")
- Actual output: `"a\uDE00\uD83D"` — the emoji's surrogate pair is split and
  swapped, producing two lone (invalid) surrogates; the string is corrupted,
  not reversed.
- Correct output: `"a😀"` (code-point-aware reversal, e.g.
  `[...s].reverse().join("")`).
- Explanation: `String.split("")` splits on UTF-16 code units, so any
  character outside the Basic Multilingual Plane (emoji, many CJK ext., etc.)
  is torn apart. Verified by execution: `reverse("a😀b")` also corrupts to
  `"b\uDE00\uD83Da"`. This counts only if the grader's reference reverses by
  code point; if the reference is the same `split("")` code, it counts for
  nothing (README: a report on a correct function "counts for nothing" — no
  penalty is stated).
- Report: `{"fn":"reverse","input":"😀a","expected":"a😀"}`

## Bug 4 — titleCase (BORDERLINE: depends on the hidden reference)

- Function: `titleCase(s)` — `s.replace(/\b\w/g, c=>c.toUpperCase())`
- Failing input: `"don't stop"`
- Actual output: `"Don'T Stop"`
- Correct output: `"Don't Stop"`
- Explanation: `\b` matches the word boundary created by the apostrophe, so
  the letter after `'` is uppercased mid-word. Verified by execution:
  `titleCase("it's a test")` gives `"It'S A Test"`. A word-based reference
  (capitalize the first letter of each word) would give `"Don't Stop"`.
  This counts only if the grader's reference is word-based; if the reference
  is the same regex, it counts for nothing (no penalty stated in the README).
- Report: `{"fn":"titleCase","input":"don't stop","expected":"Don't Stop"}`

## Functions verified CORRECT (tested by execution, not reported)

- `sum` — `sum([1,2,3])=6`, `sum([])=0`, `sum([-1,1])=0`. Correct.
- `max` — `max([1,9,3])=9`, `max([-5,-1])=-1`, `max([7])=7`. Correct.
  (Empty-array behaviour is undefined by the challenge; not reported.)
- `isPalindrome` — `racecar`→true, `hello`→false, `""`→true. Correct
  (file comments it "ok"; case-sensitivity is the standard naive definition).
- `clamp` — in-range, below, above, and both boundaries all correct.
- `unique` — `[1,1,2,2,3]`→`[1,2,3]`, strings and empty array correct.
- `average` — `[1,2,3]`→2, `[5]`→5, `[2,4]`→3. Correct.
  (Empty-array `NaN` matches the natural reference; not reported.)

## Candidates considered and NOT reported

- `titleCase("HELLO WORLD")` returns `"HELLO WORLD"` (does not lowercase the
  rest of each word). Many standard titleCase implementations behave exactly
  this way, so it is weaker than the apostrophe case for the same function;
  one report per function was kept.
- `titleCase("éclair")` leaves `é` lowercase (`\w` is ASCII-only). Same
  reasoning as above, and weaker than the apostrophe case.
- `max([])` / `average([])` edge cases: behaviour is unspecified by the
  challenge; the natural reference behaves the same way. Not reported.

## Why the borderline reports are included

The challenge README states the metric is the count of verified bugs and that
"reporting a correct function counts for nothing" — no penalty, no stated cap
on reports. Including `reverse` and `titleCase` therefore has non-negative
expected value: +1 each if the hidden reference agrees, +0 if it does not.
`report-conservative.json` (factorial + countVowels only) is provided in case
the parent judges otherwise.

## Open questions about the submission format

1. The challenge README defines the entry only as "a JSON list
   `[{fn, input, expected}]`". It does not say the file name, whether the
   JSON goes in the repo, or whether it is sent as the API submission
   payload. The parent (who handles submission) needs to pick the channel;
   `report.json` here contains exactly the specified list and nothing else
   (no extra fields, in case the grader validates the schema strictly).
2. The public repo's grader (`grader/`) is FORECAST-only (v1, Brier scoring);
   the bug-hunt reference implementation is NOT in the public repo, so the
   borderline calls on `reverse` / `titleCase` cannot be settled from the
   repo. The bug-hunt grading runs server-side / in a later grader version.
3. Provenance (from the public grader's `provenance.js`, v1 floor): a
   submission transcript must be ≥32 chars and reference the entrant
   (address or handle). If the bug-hunt submission takes a transcript, it
   should mention the agent wallet / handle.
4. One report per function was assumed (a bug = a broken function). If the
   grader instead counted distinct failing inputs, extra inputs per function
   (e.g. `factorial(2)`, `countVowels("aEiOu")`) could be added — but that
   risks looking like spam; not done here.
