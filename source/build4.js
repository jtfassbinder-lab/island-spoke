const fs = require('fs');
const L = require('./lib.js');
const { C, W, P, B, N, H, sp, pageBreak, cell, table, banner, shadedBox, headerTable, makeDoc, TableRow, AlignmentType, Packer } = L;
const { Paragraph: Pa, ImageRun } = require('docx');
const CEN = AlignmentType.CENTER;
const sec = (t) => P([[t, { bold: true, color: C.white, size: 26 }]], { shade: C.navy, before: 0, after: 120 });
const sub = (t, o = {}) => H(t, { before: o.before ?? 160, size: 24 });
const note = (t) => P([[t, { size: 18, color: C.grey }]], { after: 80 });
const say = (t) => P([[t, { italics: true }]], { after: 100 });

const g = [];
g.push(banner('PROCTOR GUIDE  -  OPERATION ISLAND SPOKE', 'POC Proctor (plays the Colonel) and 2 Support POC per group  |  Level II - Directive Performance'));
g.push(sp(100));
g.push(P('Four sections: 1. how to run the calculator, 2. what happens and when, 3. what to read and hand out, 4. how to push back as the Colonel. The calculator does all the math. Your job is timing, reading, and pressure.'));

// ================= 1. CALCULATOR =================
g.push(sec('1. HOW TO RUN THE CALCULATOR'));
g.push(table([2000, W - 2000], [new TableRow({ children: [
  cell([new Pa({ alignment: CEN, children: [new ImageRun({ type: 'png', data: fs.readFileSync(__dirname + '/calc_qr.png'), transformation: { width: 115, height: 115 } })] })], { w: 2000 }),
  cell([[['Open it before 0920', { bold: true, color: C.navy }]], 'Scan the code or go to jtfassbinder-lab.github.io/island-spoke on a phone or laptop. No sign-in.', 'Pick your group under Export, then press Reset game at the bottom.', 'Use the Phase Timer at the top right: Plan 13:00, Brief 5:00, Dice 2:00.'], { w: W - 2000 }),
] })]));
g.push(sub('Every day, in this order'));
g.push(N([['Day 4 only: ', { bold: true }], 'press Apply opening strike first. Tell Maintenance which 2 jets went Down.'], { ref: 'nums' }));
g.push(N([['Jets: ', { bold: true }], 'as the Wing CC briefs, add each jet to its tasker (pick the aircraft, press Add jet). A tasker with no jet fails.'], { ref: 'nums' }));
g.push(N([['Repairs: ', { bold: true }], 'in the Repairs panel, press + under Fix once per jet Maintenance is repairing. Cannibalize needs 2 Down jets of the same type.'], { ref: 'nums' }));
g.push(N([['Shift posture: ', { bold: true }], 'set it if they chose Extended or Rest. Otherwise leave Normal.'], { ref: 'nums' }));
g.push(N([['Injects: ', { bold: true }], 'tick Refuel the C-17 if they did (Day 1). Mark each inject Success or Failure (criteria in Section 3).'], { ref: 'nums' }));
g.push(N([['Execute: ', { bold: true }], 'press Execute Day. The calculator rolls every jet.'], { ref: 'nums' }));
g.push(N([['Read the readout aloud, ', { bold: true }], 'top to bottom: each success or failure line, jets lost, jets repaired, what is still Down, jets Ready.'], { ref: 'nums' }));
g.push(N([['Close Day. ', { bold: true }], 'Damaged and repaired jets carry into the next day automatically.'], { ref: 'nums' }));
g.push(sub('If something goes wrong'));
g.push(B([['Red message at the bottom: ', { bold: true }], 'the plan breaks a rule (jet not Ready, F-22 on a strike, over 14 points). Tell the Wing CC to fix it.']));
g.push(B([['After the bunker: ', { bold: true }], 'Maintenance asks you about one aircraft type at a time. Read Ready, Down, and Out from the Fleet panel.']));
g.push(B([['At ENDEX: ', { bold: true }], 'press Copy summary and send it to the Activity Lead.']));
g.push(B([['Calculator down: ', { bold: true }], 'roll a d6 per jet. F-22 hits on 2+, F-35A on 3+, F-15EX on 4+ (3+ on a strike), F-16 on 5+. One hit = the tasker succeeds.']));

// ================= 2. WHAT HAPPENS AND WHEN =================
g.push(pageBreak());
g.push(sec('2. WHAT HAPPENS AND WHEN'));
g.push(P('Four days, 20 minutes each: plan 13 minutes, brief the Colonel 5, dice 2. The wing gets 14 Wing Points a day to fly and fix jets. A change of command happens between Day 2 and Day 3.'));
g.push(headerTable([1300, 2600, 3200, W - 7100], ['Time', 'What is happening', 'Proctor', 'Support POC'], [
  ['0850', 'Setup', 'Open the calculator. Reset game.', 'Room set, papers stacked in order (Section 3).'],
  ['0920', 'Day 1 starts: Show of Force', 'Read the scenario. GLP Lead #1 (pre-assigned) takes command. Give Maintenance the start status.', 'Hand out GMC Guides, Aircraft Cards, Day 1 Orders, Day 1 Worksheet.'],
  ['0930', 'C-17 arrives', 'Read the C-17 inject.', ''],
  ['0933', 'Day 1 brief', 'Colonel: push back (Section 4).', ''],
  ['0938', 'Day 1 dice', 'Execute, read the readout, Close Day.', ''],
  ['0940', 'Day 2 starts: FONOP Escort', '', 'Hand out Day 2 Orders and Day 2 Worksheet.'],
  ['0953 / 0958', 'Day 2 brief, then dice', 'Push back. Execute, read, Close Day.', ''],
  ['1000', 'Turnaround: Wing CC killed', 'Read the inject. GLP Lead #2 (pre-assigned) takes command. Give the Bunker Card.', 'Lockdown (Section 3).'],
  ['1005', 'Day 3 starts: Strike Ashore', 'Answer Maintenance by aircraft type.', 'Hand out Day 3 Orders and Day 3 Worksheet.'],
  ['1015', 'Casualties arrive', 'Read the casualty inject.', ''],
  ['1018 / 1023', 'Day 3 brief, then dice', 'Push back. Execute, read, Close Day.', ''],
  ['1025', 'Day 4 starts: Defend Andersen', 'Apply opening strike. Tell Maintenance which jets.', 'Hand out Day 4 Orders and Day 4 Worksheet.'],
  ['1038 / 1043', 'Day 4 brief, then dice', 'Push back. Execute, read the readout and end state.', ''],
  ['1045', 'Debrief', 'Run the flight debrief. Evaluator takes Lead #2.', ''],
  ['1050', 'ENDEX', 'Copy summary to the Activity Lead.', 'Collect papers. Reset the room.'],
], { firstFill: C.label, firstBold: true, firstCenter: true }));
g.push(sub('What the wing is up against each day'));
g.push(headerTable([2300, W - 2300], ['Day', 'The problem'], [
  ['1. Show of Force', 'China is massing. Fly presence missions. Nothing shoots back, so most wings fly everything and pay for it later.'],
  ['2. FONOP Escort', 'Cover a Navy transit near Chinese destroyers. The Navy is out of missiles. First real choice about what matters most.'],
  ['3. Strike Ashore', 'New commander, no records, strike Chinese forces ashore. F-22s cannot strike.'],
  ['4. Defend Andersen', 'China hits the base. 6 taskers, 2 jets already down. Whatever the wing saved is all it has.'],
], { firstFill: C.label, firstBold: true }));

// ================= 3. WHAT TO READ AND HAND OUT =================
g.push(sp(200));
g.push(sec('3. WHAT TO READ AND HAND OUT'));
g.push(headerTable([1300, W - 1300], ['Time', 'Support POC hands out'], [
  ['0920', 'GMC Guides, Aircraft Reference Cards, Day 1 Orders, Day 1 Worksheet'],
  ['0940', 'Day 2 Orders, Day 2 Worksheet'],
  ['1005', 'Day 3 Orders, Day 3 Worksheet (the Proctor gives Lead #2 the Bunker Card)'],
  ['1025', 'Day 4 Orders, Day 4 Worksheet'],
], { firstFill: C.label, firstBold: true, firstCenter: true }));
g.push(note('Each day starts with that day\u2019s Orders and Worksheet: Day 2 Orders at 0940, Day 3 Orders at 1005, Day 4 Orders at 1025. Never hand out a day early. Hand out orders, do not read them aloud. Read only what is below.'));
g.push(sub('0920 Scenario'));
g.push(say('"You are the leadership of a fighter wing at Andersen Air Force Base, Guam. Recent activity on the Chinese mainland shows China is mobilizing. Your job is to keep Andersen at the highest readiness possible and to be seen doing it, as a visual deterrent. You have 14 fighters and 14 Wing Points each day. Points pay for flying jets and fixing them. You will not have enough to do everything. Each day you get orders with taskers. Brief the Colonel on what you will do and why. If this turns into a fight, you fight with what you kept ready."'));
g.push(P([['Then: ', { bold: true }], 'GLP Lead #1 is pre-assigned; confirm they are in the room. Tell Maintenance: "11 of 14 Ready. One F-35A, one F-15EX, and one F-16 are Down." ', ['No questions after this.', { bold: true }]]));
g.push(sub('0930 C-17 inject'));
g.push(say('"A lost plane from the 62nd Airlift Wing needs refueling and is redirected to your base. It carries 3 food pallets, 5 beds, 20 gallons of water and 10 individual tents. Along with the resources, it has 2 pilots, 1 loadmaster and 5 crew. You must account for this into your resources and take care of the crew indefinitely."'));
g.push(P([['Success: ', { bold: true, color: C.green }], 'they refuel it (1 point) and say how the 8 crew are housed and fed. ', ['Failure: ', { bold: true, color: C.red }], 'the crew is never addressed.']));
g.push(sub('1000 Turnaround'));
g.push(say('"Your Wing Commander has been assassinated by an insider threat. As a result, your base goes into FPCON Delta. You are forced to go into a bunker."'));
g.push(N('Evaluator takes Lead #1 outside for their debrief.', { ref: 'nums2' }));
g.push(N([['Support POC: ', { bold: true }], 'all GMC out of the room. Anyone inside after 30 seconds is eliminated. Remove every note and the Day 1 and 2 Orders and Worksheets.'], { ref: 'nums2' }));
g.push(N('GLP Lead #2 (pre-assigned) takes command. Hand them only the Bunker Card: "14 jets assigned. Status unknown. 14 Wing Points per day."', { ref: 'nums2' }));
g.push(N('GMC back in at 1003. Lead #1 rejoins Ops after the debrief.', { ref: 'nums2' }));
g.push(sub('1015 Casualty inject'));
g.push(say('"Six U.S. military personnel are requesting urgent medical assistance after their ship was struck by adversarial troops; all members request a place to stay and immediate physical examination. Two are conscious but report concussion symptoms. One was impaled by a metal pole through their stomach. Two have shallow breathing after being shot in the back. One suffered a wound to the arm with massive arterial bleeding. They request an emergency helicopter to pick them up."'));
g.push(P([['Success: ', { bold: true, color: C.green }], 'they request a MEDEVAC and treat the arterial bleed first, then breathing, then the impalement (pole stays in), then concussions. ', ['Failure: ', { bold: true, color: C.red }], 'no MEDEVAC, or the bleed is not first.']));
g.push(sub('1025 Opening strike (Day 4)'));
g.push(say('"China\'s missiles hit the flightline before you can plan. You have lost two jets." Then name the 2 jets the calculator picked.'));
g.push(sub('1043 End state (after the Day 4 readout)'));
g.push(say('4 or more of 6 taskers succeeded: "Andersen holds."   3 or fewer: "Andersen is overwhelmed."   Then: "You have ___ of 14 jets Ready."'));

// ================= 4. COLONEL =================
g.push(pageBreak());
g.push(sec('4. PUSH BACK AS THE COLONEL'));
g.push(shadedBox([P([['Be critical. Act fast. ', { bold: true, color: C.red, size: 24 }], ['You are a busy Colonel with 5 minutes. Stand up. Start the clock when they start talking and cut them off at 5:00. Interrupt anything vague: "Which jet? How many? Why that one?" Do not help them, do not explain the rules, do not accept "we think." If they cannot answer, say "Noted," and move on. Never tell them if a plan is good before the dice.', { color: C.navy }]], { after: 0 })], C.cream));
g.push(sub('What the brief must cover (cut them off if it does not)'));
g.push(B('How many jets are Ready, Down, and Out (Maintenance speaks first).'));
g.push(B('Which jets on which tasker, and what weapons they carry.'));
g.push(B('What they left uncovered on purpose.'));
g.push(B('How the 14 points split between flying and repairs.'));
g.push(sub('Pushback by day (ask at least two)'));
g.push(headerTable([2100, W - 2100], ['Day', 'Ask'], [
  ['1. Show of Force', ['"Why are both F-22s flying a show of force? What does that cost you tomorrow?"', '"Three jets are Down. Why are you not fixing them?"', '"Where are the 8 C-17 crew sleeping tonight?"']],
  ['2. FONOP Escort', ['"The Navy has no missiles. Why is that not your top tasker?"', '"Which tasker did you give up, and what happens if it fails?"', '"What are you protecting for the rest of this week?"']],
  ['3. Strike Ashore', ['"You lost your commander and your records. What do you actually know right now?"', '"What is that jet carrying for the strike? What does that do to a ground target?"', '"The arterial bleed is dying while you plan. What did you do first?"']],
  ['4. Defend Andersen', ['"Six taskers. Which one are you letting fail?"', '"Where are your F-22s, and why there?"', '"If this fails, does Andersen survive? Defend that."']],
], { firstFill: C.label, firstBold: true }));
g.push(sub('Correct on the spot (hard rules)'));
g.push(B('A Down jet cannot fly.   An F-22 cannot fly a strike.   Flying plus repairs cannot go over 14 points.   Ops does not plan before Maintenance reports.'));
g.push(sub('After the readout'));
g.push(P('Do not soften it. Read the failure lines flat. If a tasker failed because nothing was assigned, say so: "Nothing was assigned. It failed."'));
g.push(sub('Debrief (1045-1050)'));
g.push(P('Horseshoe, most junior first. Ask: "Which day cost you the jets you needed on Day 4?" Push past "bad dice" to the decision behind it. Each lead names one thing they would change.'));

(async () => {
  fs.writeFileSync('Island_Spoke_Proctor_Guide.docx', await Packer.toBuffer(makeDoc(g, 720)));
  console.log('done');
})();
