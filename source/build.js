const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, BorderStyle, LevelFormat, PageBreak, VerticalAlign,
} = require('docx');

// ---------- palette (matched to the Silver Bullet ConOps) ----------
const C = {
  navy: '1F3864', banner: '1F3A68', bannerSub: '2F5597', blueHdr: '2E75B6',
  boxBlue: 'D9E8F0', label: 'DEEAF1', gold: 'C9A400', cream: 'FFF2CC',
  green: '38571A', lightGreen: 'E2EFDA', red: 'C00000', pink: 'F8D7D7',
  qGold: 'E0A800', grey: '666666', line: 'A6C3DC', white: 'FFFFFF', hl: 'FFE599',
};
const FONT = 'Arial';
const W = 9360; // content width, 1" margins on Letter

const border = (color = C.line) => ({ style: BorderStyle.SINGLE, size: 4, color });
const allBorders = (color) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });

function run(text, o = {}) {
  return new TextRun({ text, font: FONT, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color, highlight: o.highlight });
}
function runs(parts, base = {}) {
  // parts: string or [text, opts]
  return (Array.isArray(parts) ? parts : [parts]).map(p => typeof p === 'string' ? run(p, base) : run(p[0], { ...base, ...p[1] }));
}
function P(parts, o = {}) {
  return new Paragraph({
    children: runs(parts, o), alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line },
    border: o.bottomRule ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 8 } } : undefined,
    shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade, color: 'auto' } : undefined,
  });
}
function B(parts, o = {}) {
  return new Paragraph({
    children: runs(parts, o), numbering: { reference: 'bullets', level: o.level || 0 },
    spacing: { after: o.after ?? 60 },
    shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade, color: 'auto' } : undefined,
  });
}
function N(parts, o = {}) {
  return new Paragraph({ children: runs(parts, o), numbering: { reference: o.ref || 'nums', level: 0 }, spacing: { after: 60 } });
}
const H = (t, o = {}) => P([[t, { bold: true, color: C.navy, size: o.size || 26 }]], { before: o.before ?? 240, after: 100, align: o.align });
const sp = (n = 120) => new Paragraph({ children: [], spacing: { after: n } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function cell(children, o = {}) {
  const kids = (Array.isArray(children) ? children : [children]).map(c =>
    (typeof c === 'string' || Array.isArray(c)) ? P(c, { size: o.size || 20, bold: o.bold, color: o.color, italics: o.italics, align: o.align, after: 40 }) : c);
  return new TableCell({
    children: kids, width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    borders: allBorders(o.borderColor || C.line), columnSpan: o.span,
    margins: { top: 90, bottom: 90, left: 140, right: 140 }, verticalAlign: o.valign || VerticalAlign.TOP,
  });
}
function table(widths, rows) {
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows });
}

// ---------- reusable styled blocks ----------
function titleBlock(title, sub) {
  const out = [P([[title, { bold: true, size: 40, color: C.navy }]], { align: AlignmentType.CENTER, after: 60 })];
  if (sub) out.push(P([[sub, { highlight: 'yellow', size: 22 }]], { align: AlignmentType.CENTER, after: 240 }));
  return out;
}
function banner(title, sub) {
  return table([W], [
    new TableRow({ children: [cell([[[title, { bold: true, size: 30, color: C.white }]]], { w: W, fill: C.banner, align: AlignmentType.CENTER, borderColor: C.banner })] }),
    new TableRow({ children: [cell([[[sub, { size: 20, color: C.white }]]], { w: W, fill: C.bannerSub, align: AlignmentType.CENTER, borderColor: C.bannerSub })] }),
  ]);
}
function timehacks(lines) {
  return table([W], [
    new TableRow({ children: [cell([[['TIMEHACK GUIDE FOR POC PROCTOR', { bold: true, color: C.white }]]], { w: W, fill: C.gold, borderColor: '999999' })] }),
    ...lines.map(l => new TableRow({ children: [cell(l, { w: W, fill: C.cream, borderColor: '999999' })] })),
  ]);
}
function shadedBox(children, fill = C.boxBlue) {
  return table([W], [new TableRow({ children: [new TableCell({ children, width: { size: W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill, color: 'auto' }, borders: allBorders('BBBBBB'), margins: { top: 140, bottom: 140, left: 180, right: 180 } })] })]);
}
function headerTable(widths, header, rows, o = {}) {
  const hdrFill = o.hdr || C.blueHdr;
  return table(widths, [
    new TableRow({ tableHeader: true, children: header.map((h, i) => cell([[[h, { bold: true, color: C.white, size: 20 }]]], { w: widths[i], fill: hdrFill, align: AlignmentType.CENTER })) }),
    ...rows.map(r => new TableRow({ children: r.map((v, i) => {
      const first = i === 0;
      const fill = first && o.firstFill ? o.firstFill : (o.bodyFill || undefined);
      return cell(v, { w: widths[i], fill, bold: first && o.firstBold, align: o.center || (first && o.firstCenter) ? AlignmentType.CENTER : undefined, size: first && o.firstBold ? 21 : 20, italics: o.italicCol === i });
    }) })),
  ]);
}
function keyValueTable(widths, rows, labelFill = C.label) {
  return table(widths, rows.map(([k, v]) => new TableRow({ children: [cell([[[k, { bold: true, size: 20 }]]], { w: widths[0], fill: labelFill }), cell(v, { w: widths[1] })] })));
}
function qCard(n, q, theme, good, wrong) {
  const wd = [1800, W - 1800];
  return table(wd, [
    new TableRow({ children: [cell([[[`Q${n}:  `, { bold: true, color: C.qGold, size: 24 }], [q, { bold: true, color: C.white, size: 24 }]]], { w: W, span: 2, fill: C.navy, borderColor: C.navy })] }),
    new TableRow({ children: [cell([[['Theme', { bold: true, size: 20 }]]], { w: wd[0], fill: C.label }), cell([[[theme, { italics: true, size: 20 }]]], { w: wd[1] })] }),
    new TableRow({ children: [cell([[['Good Answer', { bold: true, size: 20 }]]], { w: wd[0], fill: C.lightGreen }), cell(good, { w: wd[1] })] }),
    new TableRow({ children: [cell([[["If They're Wrong", { bold: true, size: 20 }]]], { w: wd[0], fill: C.pink }), cell([[[wrong, { italics: true, color: C.grey, size: 20 }]]], { w: wd[1] })] }),
  ]);
}
function makeDoc(children) {
  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    numbering: { config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '●', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '○', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } } ] },
      ...['nums', 'nums2', 'nums3', 'nums4', 'nums5', 'nums6'].map(r => ({ reference: r, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] })),
    ] },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children }],
  });
}

// ---------- shared game data ----------
const ATO = [
  ['1', 'Competition: deter', 'Red forces massing on the mainland. Expect presence taskings.',
    [[['Priority: Show of force', { bold: true }], ' over the Marianas (needs 2 successes, any load). Deterrence CAP (A2A). Bomber task force escort (A2A).']],
    'None', 'Red reads weakness. Turn 2 adds a 4th tasking (DCA).'],
  ['2', 'Crisis', 'Red naval activity near the Marianas.',
    [[['Priority: Shadow Red destroyers', { bold: true }], ' acting strangely near Guam (Strike or Multi). DCA. Escort for a P-8 patrol (A2A).']],
    'Red cyber intrusion on the maintenance system: every fix costs 1 more this turn.', "The destroyers reach firing position. Turn 4's opening strike takes 1 extra jet."],
  ['3', 'Conflict: offense', 'Higher headquarters orders offensive operations. (Never read: lost in the bunker.)',
    [[['Priority: Strike package', { bold: true }], ' on Red forces ashore (needs 2 successes, Strike or Multi). Escort for the strike (A2A). DCA.']],
    'Red retaliates on the parts warehouse: full repairs cost 1 more for the rest of the game.', "Red keeps the initiative. Every die on Turn 4's priority mission is at -1."],
  ['4', 'Base under attack', 'Red is massing everything. Expect an attack on Andersen.',
    [[['Priority: Defend Andersen', { bold: true }], ' (needs 3 successes, A2A or Multi). DCA. Strike on Red missile launchers (Strike or Multi).']],
    'Opening Red missile strike: 2 Ready jets go Down. Fuel barge sunk: 11 points this turn instead of 14.', 'Andersen is hit hard. Every jet that flew this turn goes Down.'],
];
function atoTable(turns) {
  const wd = [900, 1400, 3360, 1900, 1800];
  return headerTable(wd, ['Turn', 'Spectrum', 'ATO taskings', 'Inject', 'If priority fails'],
    turns.map(t => [[[[t[0], { bold: true }]]], t[1], t[3], t[4], t[5]]), { firstFill: C.label, firstCenter: true });
}

// ===================================================================
// 1. POC GUIDE (ConOps style)
// ===================================================================
const poc = [];
poc.push(...titleBlock('SCENARIO - OPERATION ISLAND SPOKE', 'Level II - Directive Performance (intense - stern - no yelling - evaluation/testing environment)'));
poc.push(P([['LLAB 7  |  6 Nov 2026  |  Training Objective WF 1.3: Apply wargaming principles to analyze and solve a tactical problem', { size: 18, color: C.grey }]], { align: AlignmentType.CENTER, after: 200 }));
poc.push(shadedBox([
  P([['END STATE', { bold: true }]], { after: 40 }), P('GMC:', { after: 60 }),
  B('Learn how sortie generation and maintenance compete for the same limited resources, and why availability decides what a wing can fly.'),
  B('Match aircraft and munitions to the tasking, and understand that the best jet is not always the right jet.'),
  B('Operate a well planned GLP through the Wing Commander, Ops, and Maintenance cells.'),
  B('Brief in a concise, well thought out manner.', { after: 200 }),
  P('POC:', { after: 60 }),
  B('Enforce the turn order: Maintenance reports availability and munitions before Ops plans.'),
  B('Run the change of command at the turnaround.'),
  B('Read the assassination inject and run the lockdown.', { level: 1 }),
  B('POC Evaluator takes GLP Lead #1 for debrief.', { level: 1 }),
  B('Identify disengaged BCs (150s/100s) and assign them the load planner "special mission."'),
]));
poc.push(sp(240));
poc.push(headerTable([2200, W - 2200], ['Time', 'Event'], [
  ['0900-0920', 'Setup'], ['0920-0930', 'POC brief on mission, cards, and worked example'], ['0930-0935', 'Planning Phase 1'],
  ['0935-0955', 'GMC Execution 1 (Turns 1 and 2)'], ['0955-1005', 'GMC Mission Brief 1'], ['1005-1010', 'Turnaround: Wing CC assassinated, lockdown, GLP Lead #2'],
  ['1010-1015', 'Planning Phase 2'], ['1015-1035', 'GMC Execution 2 (Turns 3 and 4)'], ['1035-1045', 'GMC Mission Brief 2'], ['1045-1050', 'Debrief'],
], { firstBold: true, firstCenter: true, center: true }));
poc.push(sp(200));
poc.push(H('Locations', { size: 24 }));
poc.push(headerTable([3000, W - 3000], ['Flight', 'Room'], [['Alpha', 'SAC Basement'], ['Bravo', 'Navy Classroom'], ['Charlie', 'Army Classroom'], ['Delta', 'Cadet Classroom']], { firstBold: true, firstCenter: true, center: true }));
poc.push(sp(120));
poc.push(H('Personnel (per room)', { size: 24 }));
poc.push(B('1 POC Proctor (plays the Colonel, reads the ATO and dice tape, rules on arguments)'));
poc.push(B('2 POC Evaluators (one per GLP lead, Form 2)'));
poc.push(B('1 Debrief Lead (the Proctor can double)'));
poc.push(B('2 Setup POC (print, set, and run the lockdown)'));
poc.push(B('1 Activity Lead floats between rooms and texts timehacks to all Proctors'));

// ---------- PHASE 1 ----------
poc.push(pageBreak());
poc.push(banner('PHASE 1', '0920-1005  |  45 Minutes  |  Led by: GLP Lead #1'));
poc.push(sp(160));
poc.push(timehacks(['0930 - Explanation ends, role cards handed out', '0935 - Planning phase ends', '0945 - Turn 1 ends', '0955 - Turn 2 ends, Execution Phase Ends', '1005 - Brief must conclude']));
poc.push(H('POC Lead Instructions', { before: 300 }));
poc.push(P('Read the scenario below aloud to all GMC cadets. Establish the following conditions before beginning:'));
poc.push(P([['Scenario:', { bold: true }]], { before: 120, after: 60 }));
poc.push(P("You are the leadership of a fighter wing at Andersen Air Force Base, Guam. Recent activity on the Chinese mainland shows Red is mobilizing. Your Wing Commander's job is to keep Andersen at the highest readiness possible and to be seen doing it, as a visual deterrent. Every day the air operations center sends taskings. You have 14 jets, 14 points a day, and not enough of anything. Ops flies them. Maintenance keeps them flying. The Wing Commander decides who gets what. If this turns into a fight, you fight with what you kept ready. You will have 5 minutes to plan, 20 minutes to execute, and then you must give a concise brief to the Colonel."));
poc.push(P([['Then hand over the GMC Guide, the Aircraft Reference Cards, the status board, and the forms. Assign GLP Lead #1 (BCL only).', {}]]));
poc.push(P([['Worked example (show on the status board, then erase):', { bold: true }]], { before: 120, after: 60 }));
poc.push(B('Maintenance reports: 11 of 14 Ready (79%), all A2A. 1 F-35A, 1 F-15EX, and 1 F-16 are Down.'));
poc.push(B('Ops puts 2 F-35As on the show of force, 1 F-15EX on the CAP, and 1 F-16 on the escort. That is 7 points.'));
poc.push(B('Maintenance takes the other 7: 1 for preventive maintenance on an F-22, 5 to repair the Down F-35A (3) and F-16 (2), and 1 held for anything that breaks.'));
poc.push(P([['You MAY NOT answer any questions after the briefing has been provided.', { bold: true }]], { before: 200 }));
poc.push(P([['If AS150s or 100s look disengaged, pull them aside and give them the load planner special mission (Appendix).', { bold: true }]], { before: 120 }));
poc.push(H('Turn Cycle (10 minutes each)'));
poc.push(N([['Taskings and Maintenance report (2 min). ', { bold: true }], 'Proctor reads the ATO and inject. Maintenance briefs availability and munitions. Ops may not plan until this is done.']));
poc.push(N([['Cell planning (3 min). ', { bold: true }], 'Ops builds the sortie plan. Maintenance plans reloads, preventive maintenance, posture, and holds points for repairs.']));
poc.push(N([['Wing CC decides (2 min). ', { bold: true }], 'Ops and Maintenance pitch their share of the points. Wing CC approves the split, posture, and plan.']));
poc.push(N([['Dice (2 min). ', { bold: true }], 'Proctor reads the dice tape: missions, then repair checks, then Red consequences.']));
poc.push(N([['Maintenance close-out (1 min). ', { bold: true }], 'Repairs, next turn availability, forecast read, loads set overnight.']));
poc.push(H('Phase 1 Taskings'));
poc.push(atoTable(ATO.slice(0, 2)));
poc.push(H('Briefing'));
poc.push(B('GLP Lead #1 briefs: availability, each tasking (aircraft, quantity, munitions, why), the points split, results, and what the wing should protect going into Phase 2.'));
poc.push(B('Provide pushback on the assumptions made by the presentation.'));
poc.push(B('Reference the Q&A bank and the strong performance criteria.'));
poc.push(B('Act stern and with limited time.'));

// ---------- PHASE 2 ----------
poc.push(pageBreak());
poc.push(banner('PHASE 2', '1005-1045  |  40 Minutes  |  Led by: GLP Lead #2'));
poc.push(sp(160));
poc.push(timehacks(['1010 - Switch finalized, GMC back in the room', '1015 - Planning phase ends', '1025 - Turn 3 ends', '1035 - Turn 4 ends, Execution Phase Ends', '1045 - Brief to commander ends']));
poc.push(H('Turnaround Inject (1005-1010)', { before: 300 }));
poc.push(P([['Read aloud: ', { bold: true }], ['"Your Wing Commander has been assassinated by an insider threat. The base is in FPCON Delta. The wing is moving to the bunker, and all intel is lost."', { italics: true }]]));
poc.push(N('POC Evaluator takes GLP Lead #1 outside for their debrief.', { ref: 'nums2' }));
poc.push(N([['Lockdown: ', { bold: true }], 'all GMC step out of the classroom for 2 minutes.'], { ref: 'nums2' }));
poc.push(N('Setup POC removes every cadet note, turn sheet, and availability report, and covers the status board. The Proctor keeps the official record.', { ref: 'nums2' }));
poc.push(N('The Turn 3 forecast is never read. Loads stay as they were at the end of Turn 2.', { ref: 'nums2' }));
poc.push(N('Proctor names GLP Lead #2 (BCL only). GMC return to the room.', { ref: 'nums2' }));
poc.push(N([['Lead #2 receives only the Bunker Card: ', {}], ['"14 jets assigned. Status unknown. 14 Wing Points per turn."', { italics: true }]], { ref: 'nums2' }));
poc.push(N('During Planning Phase 2, Maintenance rebuilds the availability and munitions report by asking the Proctor about one aircraft type at a time. Answer each truthfully.', { ref: 'nums2' }));
poc.push(N('Lead #1 rejoins Ops after their debrief.', { ref: 'nums2' }));
poc.push(H('Additions'));
poc.push(B('A new BCL GLP lead is selected.'));
poc.push(B('No further information is to be given by the POC lead.'));
poc.push(H('Phase 2 Taskings'));
poc.push(atoTable(ATO.slice(2, 4)));
poc.push(H('Briefing'));
poc.push(B('GLP Lead #2 briefs the final COA: how the wing defended Andersen, availability at ENDEX, and what they would change.'));
poc.push(B('Provide pushback on the assumptions made by the presentation.'));
poc.push(B('Act stern and with limited time.'));

// ---------- PHASE 3 ----------
poc.push(sp(300));
poc.push(banner('PHASE 3  -  DEBRIEF', '1045-1050  |  5 Minutes  |  Led by: GMC Lead(s) + POC Lead'));
poc.push(sp(160));
poc.push(timehacks(['1045 - GMC debrief begins', '1045 - Second POC Evaluator takes GLP Lead #2 aside to debrief', '1050 - ENDEX']));
poc.push(sp(80));
poc.push(B('Debrief follows the framework: Event Recap, Learning Focal Points, Contributing Factors, Root Causes, Instructional Fixes.'));
poc.push(B('Read the status board column by column. Where did availability drop, and which decision caused it?'));
poc.push(B('POC should act only to redirect if BCLs are failing to debrief properly.'));
poc.push(B('Minimally intervene.', { level: 1 }));
poc.push(B('May suggest focal points or lessons learned if GMC struggle.', { level: 1 }));

// ---------- APPENDIX ----------
poc.push(pageBreak());
poc.push(P([['APPENDIX - POC EVALUATION GUIDE', { bold: true, size: 28, color: C.navy }]], { align: AlignmentType.CENTER, after: 300 }));
poc.push(H('GAME RULES (PROCTOR REFERENCE)', { align: AlignmentType.CENTER, size: 26 }));
poc.push(B([['Wing Points decide everything. ', { bold: true }], '14 per turn. Ops and Maintenance split them, the Wing CC approves. Unused points are lost.']));
poc.push(B([['Flying a jet ', { bold: true }], 'costs its points to fly (Ops). ', ['Fixing a jet ', { bold: true }], 'costs its points to fix (Maintenance). A fixed jet is Ready next turn.']));
poc.push(B([['Resolve a mission: ', { bold: true }], 'escorts first, then 1 die per jet against its success number. A 1 always fails, a 6 always succeeds. Then every jet that flew rolls its repair die.']));
poc.push(B([['Package: ', { bold: true }], '2 jets on one tasking, both pay, keep the better roll. Priority taskings needing 2 or 3 successes need that many jets.']));
poc.push(B([['Aggressive profile: ', { bold: true }], '+1 on the mission die, repair range +1.']));
poc.push(B([['Loads: ', { bold: true }], 'set overnight for free. Mid-turn change costs 1 point per jet. Wrong load cannot fly. Multi flies anything at -1.']));
poc.push(B([['Arguments: ', { bold: true }], 'anything not covered, the Proctor rules Likely, Unlikely, or Uncertain (next dice tape number, 4+ succeeds, +1 for correct doctrine).']));
poc.push(sp(120));
poc.push(headerTable([2400, 1600, W - 4000], ['MAINTENANCE OPTION', 'POINTS', 'EFFECT'], [
  ['Full repair', 'Fix cost', 'Ready next turn'],
  ['Quick fix', 'Half fix cost, round up', 'Ready next turn, -1 on next mission die, repair range +1'],
  ['Cannibalize', '0', 'Strip one Down jet to fix another of the same type. Stripped jet is Out for the game'],
  ['Preventive maintenance', '1', 'Ready jet: next repair range shrinks by 1'],
  ['Extended shifts (12s)', 'Costs 3', 'Every fix costs 1 less this turn'],
  ['Rest', 'Gives +3', 'Every jet flown costs 1 more this turn'],
], { firstFill: C.label, firstBold: true }));
poc.push(P([['Dice tape: ', { bold: true }], 'roll 60 d6 results after the playtest and print one copy per Proctor. Every room reads the same tape in order so all four flights get the same luck.'], { before: 160 }));

poc.push(pageBreak());
poc.push(H('What Strong Performance Looks Like', { align: AlignmentType.CENTER }));
poc.push(headerTable([2600, W - 2600], ['CRITERION', 'WHAT TO LOOK FOR'], [
  ['Availability Drives the Plan', 'Ops waits for the Maintenance report and only plans with Ready jets carrying the right load.'],
  ['Points Split Logic', 'Wing CC splits points with a stated reason and says out loud what each cell gives up.'],
  ['Right Jet for the Job', 'Saves the F-22 for priority air-to-air taskings. Uses F-16s and F-15EXs where quantity matters more than quality.'],
  ['Munitions Planning', 'Maintenance loads from the forecast and has Strike or Multi jets ready before Turn 3.'],
  ['Protecting the Force', 'Holds points back for repairs and keeps enough Ready A2A jets to defend Andersen in Turn 4.'],
  ['Reasoning Quality', 'More important than the right answer. Can the cadet explain WHY? Solid logic with a bad roll deserves credit.'],
  ['Brief Clarity', 'Covers availability, each tasking (aircraft, quantity, munitions, why), the points split, and results. Military bearing maintained.'],
  ['New Lead', 'Lead #2 takes charge without hesitation and has Maintenance rebuild the picture fast.'],
], { hdr: C.green, firstFill: C.lightGreen, firstBold: true, firstCenter: true, center: true }));
poc.push(H('Common Failure Modes', { align: AlignmentType.CENTER, before: 360 }));
poc.push(P('Note: for the POC in charge/"Colonel," this should be provided during the brief or debrief, not during execution. If they fail during execution, provide pushback during their brief and act upset.', { align: AlignmentType.CENTER }));
poc.push(headerTable([2300, 3400, W - 5700], ['FAILURE MODE', 'WHAT IT LOOKS LIKE', 'HOW TO HANDLE'], [
  ['Ops plans before Maintenance reports', 'Ops picks jets that are Down or carry the wrong load', 'Rule the sortie invalid. Ask who told them that jet was Ready.'],
  ['Fly everything in Turn 1', 'All points to Ops, no repairs, availability drops', 'Let it happen. In Turn 4 ask: "Where are the jets you flew in Turn 1?"'],
  ['F-22 on every tasking', 'Both F-22s fly every turn, Maintenance cannot fix anything else', 'Ask what the F-22 cost versus two F-35As.'],
  ['Wrong munitions', 'A2A jets on a strike, or no strike loads before Turn 3', 'Correct on the spot. Ask what the forecast said.'],
  ['Maintenance goes quiet', 'Reports once, then lets Ops take all the points', 'Ask: "What does the wing lose if Ops gets that point?"'],
  ['No rationale', 'Cadet assigns jets but cannot explain why', "Push: 'Walk me through your reasoning.' Note if unable to articulate."],
  ['New Lead paralysis', 'Lead #2 defers, group argues, no one rebuilds the picture', 'Note as leadership observation. Do not intervene unless full breakdown.'],
], { hdr: C.red, firstFill: C.pink, firstBold: true, firstCenter: true, center: true, italicCol: 2 }));

poc.push(H('Grader Reminders', { before: 360 }));
poc.push(B('The standard is REASONING, not perfection. A cadet who picks the wrong jet but explains solid logic deserves recognition.'));
poc.push(B('If a cadet flies a jet that is Down or loaded wrong, immediate correction. This is a hard knowledge failure.'));
poc.push(B('Probe every points split that leaves Maintenance nothing for repairs.'));
poc.push(B('Disengaged BCs (150s/100s): pull aside and read, "You are the wing\'s load planner. Here are 3 jets and tomorrow\'s forecast. Pick a load for each and brief the Maintenance chief on why in 1 minute." Their loads become the overnight loads. Grade the reasoning.'));
poc.push(sp(160));
poc.push(shadedBox([P([['KEY TEACHING MOMENT:  ', { bold: true, color: C.gold }], ['Most cadets will treat sortie generation as Ops\' job alone. Maintenance decides what can fly. Push them on three things: (1) every sortie today is a repair tomorrow, (2) the best jet is not always the right jet, and (3) readiness is a decision the wing makes every turn, not something it is handed.', { color: C.navy }]], { after: 0 })], C.cream));

poc.push(pageBreak());
poc.push(P([['POC Q&A BANK', { bold: true, size: 28, color: C.navy }]], { after: 60 }));
poc.push(P([['Inject at least 2 questions per group during each briefing.', { italics: true, color: C.red }]], { after: 200 }));
const qs = [
  ['Why not fly both F-22s every turn?', 'Cost vs. capability', 'The F-22 costs 4 to fly and 5 to fix, and breaks 4 times in 6. Flying both drains Maintenance. Save them for priority air-to-air taskings like defending Andersen.', 'If cadets flew both every turn: ask what the wing had left for Turn 4.'],
  ['Why did Ops wait for the Maintenance report?', 'Availability drives operations', 'You can only fly jets that are Ready and carry the right load. Maintenance is the only cell that knows that.', 'If Ops planned first: ask how they knew that jet was Ready and loaded.'],
  ['What did you load from the forecast, and why?', 'Munitions planning', 'Ties each load to the forecast, and has Strike or Multi jets ready before the strike taskings arrive.', 'If loads were all A2A: ask what the forecast said and what a strike needs.'],
  ['Lead #2, how did you rebuild the picture after the bunker?', 'Mission command / taking charge', 'Had Maintenance query the Proctor by aircraft type, set priorities fast, and kept the wing moving.', 'If Lead #2 froze: ask what they knew at 1015 and how they found it out.'],
];
qs.forEach((q, i) => { poc.push(qCard(i + 1, ...q)); poc.push(sp(200)); });

poc.push(pageBreak());
poc.push(P([['FORMS', { bold: true, size: 28, color: C.navy }]], { align: AlignmentType.CENTER, after: 200 }));
poc.push(H('Aircraft Status Board (print 11x17, kept by Maintenance)'));
poc.push(P([['Each entry is Ready / Down / Out, then load count. Example: "R3 D1 O0, A2 S1." Never erase a past column.', { size: 18, color: C.grey }]]));
const sbW = [1700, 900, 1352, 1352, 1352, 1352, 1352];
poc.push(headerTable(sbW, ['Aircraft', 'Qty', 'Start', 'End T1', 'End T2', 'End T3', 'End T4'], [
  ['F-22', '2', 'R2 D0 O0, A2', '', '', '', ''], ['F-35A', '3', 'R2 D1 O0, A2', '', '', '', ''], ['F-15EX', '4', 'R3 D1 O0, A3', '', '', '', ''], ['F-16', '5', 'R4 D1 O0, A4', '', '', '', ''],
  ['Availability', '14', '11/14 (79%)', '', '', '', ''], ['Taskings done', '', '-', '', '', '', ''], ['Priority', '', '-', '', '', '', ''],
], { firstFill: C.label, firstBold: true, center: true }));
poc.push(H('Availability and Munitions Report (Maintenance, every turn)'));
poc.push(headerTable([1700, 960, 960, 960, 1195, 1195, 1195, 1195], ['Aircraft', 'Ready', 'Down', 'Out', 'A2A', 'Strike', 'Multi', 'QF / PM'],
  ['F-22', 'F-35A', 'F-15EX', 'F-16', 'Wing'].map(a => [a, '', '', '', '', a === 'F-22' ? '-' : '', a === 'F-22' ? '-' : '', '']), { firstFill: C.label, firstBold: true, center: true }));
poc.push(P('Wing availability: ____ / 14 = ____ %', { before: 120 }));
poc.push(P('Why we loaded this way: ____________________________________________'));
poc.push(H('Turn Sheet (one per turn)'));
poc.push(headerTable([3000, 1500, 2430, 2430], ['Line', 'Filled by', 'Entry', 'Why'], [
  ['Intent', 'Wing CC', '', ''], ['Points split (Ops / Maint, total 14)', 'Wing CC', '', ''], ['Shift posture', 'Maint, Wing CC approves', '', ''],
  ['Tasking 1: aircraft, qty, load, profile', 'Ops', '', ''], ['Tasking 2: aircraft, qty, load, profile', 'Ops', '', ''], ['Tasking 3: aircraft, qty, load, profile', 'Ops', '', ''],
  ['Reloads and preventive maintenance', 'Maint', '', ''], ['Repairs after the dice', 'Maint', '', ''], ['Results: taskings done, priority Y/N, jets Down', 'Proctor', '', ''], ['Availability for next turn', 'Maint', '', ''],
], { firstFill: C.label, firstBold: true }));
poc.push(sp(400));
poc.push(P([['- END OF GLP - OPERATION ISLAND SPOKE -', { bold: true, size: 28, color: C.navy }]], { align: AlignmentType.CENTER }));

// ===================================================================
// 2. GMC GUIDE
// ===================================================================
const gmc = [];
gmc.push(P([['SCENARIO - OPERATION ISLAND SPOKE', { bold: true, size: 36, color: C.navy }]], { align: AlignmentType.CENTER, after: 120, bottomRule: true }));
gmc.push(sp(120));
const shadeP = (parts, o = {}) => P(parts, { shade: C.boxBlue, after: 0, ...o });
const shadeB = (parts) => B(parts, { shade: C.boxBlue, after: 0 });
gmc.push(P([['Scenario:', { bold: true }]], { after: 60 }));
gmc.push(shadeP("You are the leadership of a fighter wing at Andersen AFB, Guam. Recent activity on the Chinese mainland shows Red is mobilizing. Your Wing Commander's job is to keep Andersen at the highest readiness possible and to be seen doing it, as a visual deterrent. If the conflict turns into a fight, you fight with what you kept ready. You have 14 fighters and 14 Wing Points a day. That is not enough to do everything."));
gmc.push(sp(200));
gmc.push(P([['Mission:', { bold: true }]], { after: 60 }));
gmc.push(shadeB('Each turn, accomplish as many of the day\'s taskings as you can.'));
gmc.push(shadeB('For each tasking, list the aircraft type, how many, and the munitions.'));
gmc.push(shadeB('Keep enough jets available for the days ahead. A jet that flies today may be broken tomorrow.'));
gmc.push(shadeB([['Brief the Colonel', { bold: true }], ' on what you flew, what you fixed, and ', ['why', { bold: true }], '.']));
gmc.push(shadeB(['Mindful of ', ['points', { bold: true }], ': every point spent flying is a point not spent fixing.']));
gmc.push(sp(200));
gmc.push(P([['Your Cells:', { bold: true }]], { after: 60 }));
gmc.push(headerTable([2400, 1600, W - 4000], ['Cell', 'Who', 'Your job each turn'], [
  ['Wing Commander', 'GLP lead', 'Split the 14 points between Ops and Maintenance. Approve the plan. Brief the Colonel.'],
  ['Ops', 'About 6 cadets', 'Pick which jets fly each tasking, how many, and how hard (normal or aggressive).'],
  ['Maintenance and Logistics', 'About 7 cadets', 'Report how many jets are available and what munitions they carry. Fix broken jets. Choose the shift posture.'],
], { firstFill: C.label, firstBold: true }));
gmc.push(sp(200));
gmc.push(P([['How a Turn Works:', { bold: true }]], { after: 60 }));
gmc.push(N([['Taskings. ', { bold: true }], 'The Proctor reads the day\'s taskings.'], { ref: 'nums3' }));
gmc.push(N([['Maintenance reports. ', { bold: true }], 'How many of each jet are Ready, Down, or Out, and what each one carries. Ops cannot plan until this is done.'], { ref: 'nums3' }));
gmc.push(N([['Plan. ', { bold: true }], 'Ops builds the sortie plan. Maintenance plans repairs and its shift posture.'], { ref: 'nums3' }));
gmc.push(N([['Wing Commander decides. ', { bold: true }], 'Ops and Maintenance each ask for their share of the 14 points. The Wing Commander splits them and approves the plan.'], { ref: 'nums3' }));
gmc.push(N([['Dice. ', { bold: true }], 'The Proctor rolls for each jet. Then Maintenance fixes what it can for tomorrow.'], { ref: 'nums3' }));
gmc.push(sp(200));
gmc.push(P([['Rules:', { bold: true }]], { after: 60 }));
[
  [['Wing Points pay for everything. ', { bold: true }], 'You get 14 per turn. Unused points are lost.'],
  [['Flying a jet costs Ops points. Fixing a jet costs Maintenance points. ', { bold: true }], 'Costs are on the Aircraft Reference Cards.'],
  'No jet always succeeds. The F-22 is the best and the most expensive to fly and fix.',
  'Every jet that flies can come back broken. A broken jet stays down until Maintenance pays to fix it.',
  'Air-to-air jets cannot strike. Strike jets cannot fight air-to-air. Multi jets can do both, but worse.',
  'Changing munitions mid-turn costs 1 point per jet.',
  'Anything not on this page: state the action, the result you want, and up to 3 reasons. The Proctor rules.',
  '5 minutes to plan, 20 minutes to execute, 10 minutes to brief the Colonel.',
].forEach(r => gmc.push(shadeB(r)));
gmc.push(sp(200));
gmc.push(P([['What to Brief the Colonel:', { bold: true }]], { after: 60 }));
gmc.push(N([['Availability: ', { bold: true }], 'how many jets are Ready now, by type (Maintenance).'], { ref: 'nums4' }));
gmc.push(N([['Each tasking: ', { bold: true }], 'aircraft, how many, munitions, and a one-sentence why.'], { ref: 'nums4' }));
gmc.push(N([['Points: ', { bold: true }], 'how you split them and why.'], { ref: 'nums4' }));
gmc.push(N([['Results: ', { bold: true }], 'what worked, what broke, and what you would do differently.'], { ref: 'nums4' }));

// ===================================================================
// 3. AIRCRAFT REFERENCE CARDS
// ===================================================================
const cards = [];
cards.push(P([['AIRCRAFT REFERENCE CARDS', { bold: true, size: 30, color: C.navy }]], { after: 60 }));
cards.push(P([['POC must know this content. Cadet asset cards are drawn from this section.', { italics: true, color: C.red }]], { after: 240 }));
const AC = [
  { code: 'F-22', name: 'F-22 RAPTOR', role: 'Air Superiority Fighter', stealth: 'YES', qty: '2',
    summary: 'The best air-to-air fighter in the wing. Wins the fight more often than any other jet, but breaks most often and costs the most to fly and fix. Carries air-to-air weapons only, so it cannot fly a strike tasker.',
    success: '5 in 6 (83%), must roll 2-6', repair: '4 in 6 (67%), on a roll of 1-4', fly: '4', fix: '5',
    configs: [['A2A', '6 AIM-120 + 2 AIM-9X']],
    weapons: [['AIM-120 AMRAAM', 'Radar-guided air-to-air missile. Engages aircraft and cruise missiles beyond visual range.'], ['AIM-9X Sidewinder', 'Heat-seeking air-to-air missile for short-range fights.']] },
  { code: 'F-35A', name: 'F-35A LIGHTNING II', role: 'Stealth Multi-Role Fighter', stealth: 'YES', qty: '3',
    summary: 'Stealthy and flexible. Can carry air-to-air weapons, bombs, or a mix of both. Good odds at a moderate cost, but there are only 3 in the wing.',
    success: '4 in 6 (67%), must roll 3-6', repair: '3 in 6 (50%), on a roll of 1-3', fly: '2', fix: '3',
    configs: [['A2A', '4 AIM-120'], ['Strike', '8 GBU-39 SDB'], ['Multi', '2 AIM-120 + 2 GBU-32 JDAM']],
    weapons: [['AIM-120 AMRAAM', 'Radar-guided air-to-air missile. Engages aircraft beyond visual range.'], ['GBU-31/32 JDAM', 'GPS-guided 2,000 or 1,000 lb bomb. Destroys fixed targets in any weather.'], ['GBU-39 SDB', '250 lb precision glide bomb. Several per jet, small blast, lower collateral risk.']] },
  { code: 'F-15EX', name: 'F-15EX EAGLE II', role: 'Heavy Multi-Role Fighter', stealth: 'NO', qty: '4',
    summary: 'A large fighter that carries more weapons than any other jet in the wing. Reliable and rarely breaks. Gets +1 on strike taskers for its payload.',
    success: '3 in 6 (50%), must roll 4-6 (+1 on strike missions)', repair: '2 in 6 (33%), on a roll of 1-2', fly: '2', fix: '3',
    configs: [['A2A', '8 AIM-120 + 4 AIM-9X'], ['Strike', '4 GBU-31 JDAM + 2 AIM-120'], ['Multi', '2 AIM-120 + 2 GBU-31 JDAM']],
    weapons: [['AIM-120 AMRAAM', 'Radar-guided air-to-air missile. Engages aircraft beyond visual range.'], ['AIM-9X Sidewinder', 'Heat-seeking air-to-air missile for short-range fights.'], ['GBU-31 JDAM', 'GPS-guided 2,000 lb bomb for large fixed targets.']] },
  { code: 'F-16', name: 'F-16 FIGHTING FALCON', role: 'Multi-Role Fighter', stealth: 'NO', qty: '5',
    summary: 'Affordable, versatile fighter. Cheap to fly, cheap to fix, and rarely breaks, but succeeds only 1 time in 3.',
    success: '2 in 6 (33%), must roll 5-6', repair: '1 in 6 (17%), on a roll of 1', fly: '1', fix: '2',
    configs: [['A2A', '4 AIM-120 + 2 AIM-9X'], ['Strike', '2 GBU-12 Paveway II + 2 AIM-9X'], ['Multi', '2 AIM-120 + 2 GBU-12 Paveway II']],
    weapons: [['AIM-120 AMRAAM', 'Radar-guided air-to-air missile. Engages aircraft beyond visual range.'], ['AIM-9X Sidewinder', 'Heat-seeking air-to-air missile for short-range fights.'], ['GBU-12 Paveway II', 'Laser-guided 500 lb bomb for vehicles and buildings.']] },
];
const kw = [2200, W - 2200];
AC.forEach((a, i) => {
  if (i > 0) cards.push(pageBreak());
  const rows = [];
  // picture slot
  rows.push(new TableRow({ height: { value: 4200, rule: 'atLeast' }, children: [cell([[['INSERT PICTURE', { color: '999999', bold: true, size: 24 }]]], { w: W, span: 2, fill: 'F2F2F2', align: AlignmentType.CENTER, valign: VerticalAlign.CENTER, borderColor: C.bannerSub })] }));
  rows.push(new TableRow({ children: [cell([[[a.code + '  ', { bold: true, size: 32, color: C.white }], [a.name, { bold: true, size: 26, color: 'BDD7EE' }], ['   |   ', { size: 24, color: C.white }], [a.role, { size: 24, color: C.white }]]], { w: W, span: 2, fill: C.bannerSub, borderColor: C.bannerSub })] }));
  const kv = [['Stealth', a.stealth], ['Quantity', a.qty], ['Summary', a.summary], ['Mission Success Rate', a.success], ['Needs Repair', a.repair], ['Commander Points to Fly', a.fly], ['Points to Fix', a.fix],
    [a.configs.length > 1 ? 'Configurations' : 'Configuration', a.configs.map(c => [[c[0] + ': ', { bold: true, size: 20 }], [c[1], { size: 20 }]])]];
  kv.forEach(([k, v]) => rows.push(new TableRow({ children: [cell([[[k, { bold: true, size: 20 }]]], { w: kw[0], fill: C.label }), cell(Array.isArray(v) ? v : v, { w: kw[1] })] })));
  rows.push(new TableRow({ children: [cell([[['WEAPON / CAPABILITY', { bold: true, color: C.white, size: 20 }]]], { w: kw[0], fill: C.navy, align: AlignmentType.CENTER }), cell([[['WHAT IT DOES', { bold: true, color: C.white, size: 20 }]]], { w: kw[1], fill: C.navy, align: AlignmentType.CENTER })] }));
  a.weapons.forEach(([wn, wd]) => rows.push(new TableRow({ children: [cell([[[wn, { bold: true, size: 20 }]]], { w: kw[0], fill: C.label }), cell(wd, { w: kw[1] })] })));
  cards.push(table(kw, rows));
});

// ---------- write ----------
(async () => {
  const out = [
    ['Operation_Island_Spoke_Aircraft_Reference_Cards.docx', cards],
  ];
  for (const [f, kids] of out) fs.writeFileSync(f, await Packer.toBuffer(makeDoc(kids)));
  console.log('done');
})();
