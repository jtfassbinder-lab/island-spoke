const fs = require('fs');
const L = require('./lib.js');
const { C, W, P, B, N, H, sp, pageBreak, cell, table, banner, timehacks, shadedBox, headerTable, makeDoc, TableRow, AlignmentType, Packer } = L;
const { Paragraph: Pa, ImageRun } = require('docx');
const CEN = AlignmentType.CENTER;
const small = (t) => P([[t, { size: 18, color: C.grey }]], { after: 80 });
const qr = () => table([1700, W - 1700], [new TableRow({ children: [
  cell([new Pa({ alignment: CEN, children: [new ImageRun({ type: 'png', data: fs.readFileSync(__dirname + '/calc_qr.png'), transformation: { width: 90, height: 90 } })] })], { w: 1700 }),
  cell([[['PROCTOR CALCULATOR', { bold: true, color: C.navy }]], '1. Add the jets Ops assigned to each tasker, and the repairs Maintenance planned.', '2. Press Execute.', '3. Read the readout aloud: successes, failures, jets lost, jets repaired, what is still Down.'], { w: W - 1700 }),
] })]);

// ================= PROCTOR CARD (2 pages) =================
const pr = [];
pr.push(banner('PROCTOR CARD  -  OPERATION ISLAND SPOKE', 'You run the game and play the Colonel  |  1 per group'));
pr.push(sp(120));
pr.push(P([['Your job: ', { bold: true }], 'hand out orders on time, read the two injects, take the brief as the Colonel, run the calculator, and read the outcome. Do not answer questions after the scenario is read.']));
pr.push(qr());
pr.push(H('Timeline', { before: 160, size: 24 }));
pr.push(headerTable([1500, W - 1500], ['Time', 'You do'], [
  ['0920', 'Read the scenario (below). Hand out GMC Guides, Aircraft Cards, Day 1 Orders. Name GLP Lead #1. Clock starts.'],
  ['0930', 'Read the C-17 inject.'],
  ['0933', 'Take the Day 1 brief as the Colonel (5 min).'],
  ['0938', 'Calculator: Execute Day 1. Read the readout. Close the day.'],
  ['0940', 'Hand out Day 2 Orders.'],
  ['0953 / 0958', 'Day 2 brief, then Execute and read the readout.'],
  ['1000', 'Turnaround (below).'],
  ['1005', 'Hand out Day 3 Orders. Lead #2 in command.'],
  ['1015', 'Read the casualty inject.'],
  ['1018 / 1023', 'Day 3 brief, then Execute and read the readout.'],
  ['1025', 'Hand out Day 4 Orders. Press "Apply opening strike." Tell Maintenance which 2 jets went Down.'],
  ['1038 / 1043', 'Day 4 brief, then Execute. Read the readout and the end state.'],
  ['1045', 'Flight debrief (Evaluator takes Lead #2).'],
], { firstFill: C.label, firstBold: true, firstCenter: true }));
pr.push(H('Scenario (read at 0920)', { before: 160, size: 24 }));
pr.push(P([['"You are the leadership of a fighter wing at Andersen Air Force Base, Guam. China is mobilizing. Keep Andersen at the highest readiness possible and be seen doing it. You have 14 fighters and 14 Wing Points a day for flying and fixing jets. You will not have enough to do everything. Each day you get orders with taskers. Brief the Colonel on what you will do and why. If this turns into a fight, you fight with what you kept ready."', { italics: true }]]));

pr.push(pageBreak());
pr.push(H('The one rule', { before: 0, size: 24 }));
pr.push(shadedBox([P([['Each jet on a tasker has a success % on its card. If at least one jet succeeds, the tasker succeeds. Every jet that flies may come back damaged. Repairs are planned before the roll and come back the next day.', { bold: true, color: C.navy }]], { after: 0 })], C.cream));
pr.push(H('Hard rules to enforce', { before: 160, size: 24 }));
pr.push(B('A jet that is Down cannot fly.'));
pr.push(B('An F-22 cannot fly a strike tasker.'));
pr.push(B('Flying plus repairs cannot go over 14 points. The calculator blocks it.'));
pr.push(B('Maintenance reports Ready, Down, and Out before Ops plans.'));
pr.push(H('Injects (read aloud)', { before: 160, size: 24 }));
pr.push(P([['0930 C-17: ', { bold: true }], ['"A lost plane from the 62nd Airlift Wing needs refueling and is redirected to your base. It carries 3 food pallets, 5 beds, 20 gallons of water and 10 individual tents. Along with the resources, it has 2 pilots, 1 loadmaster and 5 crew. You must account for this into your resources and take care of the crew indefinitely."', { italics: true }]]));
pr.push(small('Success: they refuel it (1 point) and say how the 8 crew are housed and fed. Mark it in the calculator.'));
pr.push(P([['1015 Casualties: ', { bold: true }], ['"Six U.S. military personnel are requesting urgent medical assistance after their ship was struck by adversarial troops; all members request a place to stay and immediate physical examination. Two are conscious but report concussion symptoms. One was impaled by a metal pole through their stomach. Two have shallow breathing after being shot in the back. One suffered a wound to the arm with massive arterial bleeding. They request an emergency helicopter to pick them up."', { italics: true }]]));
pr.push(small('Success: they request a MEDEVAC and treat the arterial bleed first (then breathing, then the impalement, then concussions).'));
pr.push(H('Turnaround (1000-1005)', { before: 160, size: 24 }));
pr.push(P([['Read: ', { bold: true }], ['"Your Wing Commander has been assassinated by an insider threat. As a result, your base goes into FPCON Delta. You are forced to go into a bunker."', { italics: true }]]));
pr.push(N('Evaluator takes Lead #1 outside. Support POC run the lockdown (GMC out, 30 seconds).', { ref: 'nums' }));
pr.push(N('Name Lead #2. Hand them only the Bunker Card: "14 jets assigned. Status unknown. 14 Wing Points per day."', { ref: 'nums' }));
pr.push(N('Maintenance rebuilds the board by asking you one aircraft type at a time. Answer from the calculator.', { ref: 'nums' }));
pr.push(H('At every brief, ask at least one', { before: 160, size: 24 }));
pr.push(B('"Why did you put your best jets on that tasker?"'));
pr.push(B('"What did you leave uncovered, and what does that cost you?"'));
pr.push(B('"How many jets will you have left if China attacks the base?"'));
pr.push(H('End state (after Day 4)', { before: 160, size: 24 }));
pr.push(P('4 or more of the 6 Day 4 taskers succeeded: "Andersen holds." 3 or fewer: "Andersen is overwhelmed." Then read how many jets are Ready out of 14. The calculator shows both.'));

// ================= EVALUATOR CARD =================
const ev = [];
ev.push(banner('EVALUATOR CARD  -  OPERATION ISLAND SPOKE', 'You grade the GLP leads  |  at least 1 per lead'));
ev.push(sp(120));
ev.push(P([['Your job: ', { bold: true }], 'watch the Wing Commander think, fill the Form 2, and debrief your lead. Do not speak during play. Grade the reasoning, not the dice.']));
ev.push(headerTable([2300, W - 2300], ['When', 'You do'], [
  ['0920-1000', 'Evaluate GLP Lead #1 (Days 1 and 2).'],
  ['1000-1005', 'Take Lead #1 outside and debrief them on the Form 2.'],
  ['1005-1045', 'Evaluate GLP Lead #2 (Days 3 and 4).'],
  ['1045-1050', 'Take Lead #2 aside and debrief them.'],
], { firstFill: C.label, firstBold: true, firstCenter: true }));
ev.push(H('What to watch each day', { before: 160, size: 24 }));
ev.push(headerTable([1800, 4600, W - 6400], ['DAY', 'LOOK FOR', 'WARNING SIGN'], [
  [[['Day 1: Show of Force', { bold: true }]], 'Lead #1', 'Covers the taskers without burning both F-22s. Plans repairs for the 3 jets that start Down. Handles the C-17: refuels it and houses and feeds the 8 crew.', 'Flies everything because nothing shoots back. Ignores the C-17 crew.'],
  [[['Day 2: FONOP Escort', { bold: true }]], 'Lead #1', 'Decides which tasker matters most and puts the best jets there (the Navy has no missiles to defend itself). Balances flying today with repairs for tomorrow. Says what the wing must protect going forward.', 'One jet on every tasker with no reason given. No repairs planned.'],
  [[['Turnaround', { bold: true }]], 'Lead #2', 'Takes charge within the first minute. Has Maintenance rebuild the board by asking about one aircraft type at a time.', 'Defers to the room. No one rebuilds the picture.'],
  [[['Day 3: Strike Ashore', { bold: true }]], 'Lead #2', 'No F-22 on the strike. Briefs bombs on the strike jets and covers the strike with an escort. Casualty inject: requests a MEDEVAC and treats the arterial bleed first.', 'Briefs air-to-air missiles for a strike. Ignores the casualties or gets the triage order wrong.'],
  [[['Day 4: Defend Andersen', { bold: true }]], 'Lead #2', 'Chooses which of the 6 taskers to cover well and which to leave thin, and names the risk. Puts the F-22s on air defense of the base.', 'Spreads one jet across all six. Cannot say what was left uncovered.'],
].map(r => [r[0], [[[r[1] + ': ', { bold: true }], r[2]]], r[3]]), { firstFill: C.label, firstBold: true }));
ev.push(pageBreak());
ev.push(H('Strong performance (every day)', { before: 0, size: 24 }));
ev.push(headerTable([2600, W - 2600], ['LOOK FOR', 'WHAT IT SOUNDS LIKE'], [
  ['Chooses what matters', 'Puts the best jets on the tasker that matters most and can say why.'],
  ['Accepts risk on purpose', 'Leaves a tasker thin or uncovered and names the cost.'],
  ['Thinks about tomorrow', 'Holds points for repairs and saves jets for the attack on the base.'],
  ['Uses Maintenance', 'Waits for the Ready/Down report before planning.'],
  ['Handles injects', 'Accounts for the C-17 crew. Requests MEDEVAC, arterial bleed first.'],
  ['Briefs clearly', 'Availability, jets per tasker, points split, and why, in 5 minutes.'],
  ['New lead (Lead #2)', 'Takes charge fast and has Maintenance rebuild the picture.'],
], { hdr: C.green, firstFill: C.lightGreen, firstBold: true }));
ev.push(H('Warning signs (every day)', { before: 160, size: 24 }));
ev.push(headerTable([2600, W - 2600], ['WATCH FOR', 'NOTE IT'], [
  ['Flies everything early', 'No repairs, availability drops before Day 4.'],
  ['One jet on every tasker', 'No priority. Cannot say what mattered most.'],
  ['Plans without Maintenance', 'Assigns jets that are Down.'],
  ['No rationale', 'Cannot answer "walk me through your reasoning."'],
  ['Freezes after the bunker', 'Lead #2 defers and no one rebuilds the board.'],
], { hdr: C.red, firstFill: C.pink, firstBold: true }));
ev.push(sp(120));
ev.push(shadedBox([P([['Remember: ', { bold: true, color: C.gold }], ['a lead who reasons well and loses to bad dice still earns a strong Form 2. A lead who wins by luck and cannot explain the plan does not.', { color: C.navy }]], { after: 0 })], C.cream));

// ================= SUPPORT CARD (1 page) =================
const su = [];
su.push(banner('SUPPORT POC CARD  -  OPERATION ISLAND SPOKE', 'Setup, hand-outs, and lockdown  |  2 per group'));
su.push(sp(120));
su.push(P([['Your job: ', { bold: true }], 'have the room ready by 0920, keep the Day Orders in order for the Proctor, and run the lockdown at 1000.']));
su.push(H('Setup (0850-0920)', { before: 120, size: 24 }));
su.push(N('Check the room. Tables for 14, a wall for the board.', { ref: 'nums' }));
su.push(N('Tape up the Availability Board (11x17). Day 1 block is pre-filled.', { ref: 'nums' }));
su.push(N('At seats: 14 GMC Guides, Aircraft Reference Cards, pencils.', { ref: 'nums' }));
su.push(N('Give the Proctor: Day 1-4 Orders (stacked in order), 4 Phase Sheets, the Bunker Card, 2 dice as backup.', { ref: 'nums' }));
su.push(N('Give the Evaluators their Form 2s.', { ref: 'nums' }));
su.push(N('Open the Proctor Calculator on the Proctor\'s device and press Reset game.', { ref: 'nums' }));
su.push(H('Lockdown (1000)', { before: 160, size: 24 }));
su.push(N('When the Proctor reads the inject, move every GMC out of the room. Anyone still inside after 30 seconds is eliminated from the GLP.', { ref: 'nums2' }));
su.push(N('Remove every note, Phase Sheet, and the Day 1 and Day 2 Orders.', { ref: 'nums2' }));
su.push(N('Cover the Availability Board.', { ref: 'nums2' }));
su.push(N('Tell the Proctor the room is clear. GMC come back in at 1003.', { ref: 'nums2' }));
su.push(H('After ENDEX (1050)', { before: 160, size: 24 }));
su.push(B('Collect all papers. Press Export spreadsheet in the calculator if the Proctor has not.'));
su.push(B('Clean and reset the room.'));
su.push(sp(160));
su.push(headerTable([3000, W - 3000], ['Group', 'Room'], [['Group 1', 'SAC Basement'], ['Group 2', 'Navy Classroom'], ['Group 3', 'Army Classroom'], ['Group 4', 'Cadet Classroom']], { firstFill: C.label, firstBold: true, center: true }));

(async () => {
  fs.writeFileSync('Island_Spoke_Proctor_Card.docx', await Packer.toBuffer(makeDoc(pr, 720)));
  fs.writeFileSync('Island_Spoke_Evaluator_Card.docx', await Packer.toBuffer(makeDoc(ev, 720)));
  fs.writeFileSync('Island_Spoke_Support_POC_Card.docx', await Packer.toBuffer(makeDoc(su, 720)));
  console.log('done');
})();
