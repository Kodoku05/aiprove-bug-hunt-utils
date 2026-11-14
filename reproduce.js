// Reproduction script for the bug-hunt-utils reports.
// Run: node reproduce.js
// Loads the challenge's utils.js (verbatim copy in this directory) and shows,
// for each report in report.json, the actual (buggy) output vs the expected
// (correct) output. Exit code 0 when every report reproduces a mismatch.
const fs = require('fs');
const u = require('./utils.js');

const reports = JSON.parse(fs.readFileSync('./report.json', 'utf8'));

let reproduced = 0;
for (const r of reports) {
  const actual = u[r.fn](r.input);
  const mismatch = JSON.stringify(actual) !== JSON.stringify(r.expected);
  if (mismatch) reproduced++;
  console.log(
    `${mismatch ? 'REPRODUCED' : 'NO-DIFF   '} ${r.fn}(${JSON.stringify(r.input)})` +
    ` -> actual ${JSON.stringify(actual)}, expected ${JSON.stringify(r.expected)}`
  );
}
console.log(`\n${reproduced}/${reports.length} reports reproduce a genuine mismatch.`);
process.exit(reproduced === reports.length ? 0 : 1);
